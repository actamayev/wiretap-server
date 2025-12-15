import isNull from "lodash/isNull"
import { Response, Request } from "express"
import Hash from "../../classes/hash"
import signJWT from "../../utils/auth-helpers/jwt/sign-jwt"
import { setAuthCookie } from "../../middleware/cookie-helpers"
import addLoginHistoryRecord from "../../db-operations/write/login-history/add-login-history-record"
import retrieveMyFunds from "../../db-operations/read/wiretap-fund/retrieve-my-funds"
import { findUserByEmail } from "../../db-operations/read/find/find-user"

export default async function login(req: Request, res: Response): Promise<void> {
	try {
		const { email, password } = req.body.loginInformation as IncomingAuthRequest

		const credentialsResult = await findUserByEmail(email)
		if (isNull(credentialsResult)) {
			res.status(400).json(
				{ message: `There is no Wiretap account associated with ${email}. Please try again.` } satisfies MessageResponse
			)
			return
		}
		if (credentialsResult.auth_method === "GOOGLE") {
			res.status(400).json({ message: "Please log in with Google" } satisfies MessageResponse)
			return
		}

		const doPasswordsMatch = await Hash.checkPassword(password, credentialsResult.password as HashedString)
		if (doPasswordsMatch === false) {
			res.status(400).json({ message: "Wrong password. Please try again." } satisfies MessageResponse)
			return
		}

		const accessToken = await signJWT({
			userId: credentialsResult.user_id,
			isActive: true // Optional: add user status
		})

		setAuthCookie(res, accessToken)
		const funds = await retrieveMyFunds(credentialsResult.user_id)

		res.status(200).json({
			personalInfo: {
				email: credentialsResult.email,
				isGoogleUser: false
			},
			funds
		} satisfies LoginSuccess)
		void addLoginHistoryRecord(credentialsResult.user_id)
		return
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error: Unable to Login" } satisfies ErrorResponse)
		return
	}
}
