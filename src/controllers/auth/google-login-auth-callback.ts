import { Request, Response } from "express"
import { isNull, isUndefined } from "lodash"
import signJWT from "../../utils/auth-helpers/jwt/sign-jwt"
import SecretsManager from "../../classes/aws/secrets-manager"
import { setAuthCookie } from "../../middleware/cookie-helpers"
import { findUserById } from "../../db-operations/read/find/find-user"
import { addGoogleUser } from "../../db-operations/write/credentials/add-user"
import createGoogleAuthClient from "../../utils/google/create-google-auth-client"
import retrieveMyFunds from "../../db-operations/read/wiretap-fund/retrieve-my-funds"
import retrieveUserIdByEmail from "../../db-operations/read/credentials/retrieve-user-id-by-email"
import addLoginHistoryRecord from "../../db-operations/write/login-history/add-login-history-record"
import createStartingFundForUser from "../../db-operations/write/wiretap-fund/create-starting-fund-for-user"

// eslint-disable-next-line max-lines-per-function
export default async function googleLoginAuthCallback(req: Request, res: Response): Promise<void> {
	try {
		const { idToken } = req.body
		const client = await createGoogleAuthClient()
		const googleClientId = await SecretsManager.getInstance().getSecret("GOOGLE_CLIENT_ID")
		const ticket = await client.verifyIdToken({
			idToken,
			audience: googleClientId
		})
		const payload = ticket.getPayload()
		if (isUndefined(payload)) {
			res.status(500).json({ error: "Unable to get payload" } satisfies ErrorResponse)
			return
		}
		if (isUndefined(payload.email)) {
			res.status(500).json({ error: "Unable to find user email from payload" } satisfies ErrorResponse)
			return
		}

		let userId = await retrieveUserIdByEmail(payload.email)
		let accessToken: string
		let isNewUser = false
		const personalInfo: BasicPersonalInfoResponse = {
			email: payload.email,
			isGoogleUser: true
		}
		let funds: SingleFund[] = []
		if (isUndefined(userId)) {
			res.status(500).json({ error: "Unable to login with this email. Account offline." } satisfies ErrorResponse)
			return
		} else if (isNull(userId)) {
			userId = await addGoogleUser(payload.email)
			accessToken = await signJWT({ userId, isActive: true })
			isNewUser = true
			const fund = await createStartingFundForUser(userId)
			funds = [fund]
		} else {
			const credentialsResult = await findUserById(userId)
			if (isNull(credentialsResult)) {
				// eslint-disable-next-line max-len
				res.status(400).json({ message: `There is no Wiretap account associated with ${payload.email}. Please try again.` } satisfies MessageResponse)
				return
			}
			accessToken = await signJWT({ userId, isActive: true })
			funds = await retrieveMyFunds(userId)
		}

		setAuthCookie(res, accessToken)

		res.status(200).json({
			isNewUser,
			personalInfo,
			funds
		} satisfies GoogleAuthSuccess)
		void addLoginHistoryRecord(userId)
		return
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error: Unable to Login with Google" } satisfies ErrorResponse)
		return
	}
}
