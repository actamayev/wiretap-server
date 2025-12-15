import { Response, Request } from "express"
import Hash from "../../classes/hash"
import signJWT from "../../utils/auth-helpers/jwt/sign-jwt"
import { addLocalUser } from "../../db-operations/write/credentials/add-user"
import doesEmailExist from "../../db-operations/read/does-x-exist/does-email-exist"
import addLoginHistoryRecord from "../../db-operations/write/login-history/add-login-history-record"
import { setAuthCookie } from "../../middleware/cookie-helpers"
import createStartingFundForUser from "../../db-operations/read/wiretap-fund/create-starting-fund-for-user"

export default async function register(req: Request, res: Response): Promise<void> {
	try {
		const registerInformation = req.body.registerInformation as IncomingAuthRequest

		const emailExists = await doesEmailExist(registerInformation.email)
		if (emailExists === true) {
			res.status(400).json({ message: "Email already taken" } satisfies MessageResponse)
			return
		}

		const hashedPassword = await Hash.hashCredentials(registerInformation.password)

		const userData: NewLocalUserFields = {
			password: hashedPassword,
			auth_method: "WIRETAP",
			email: registerInformation.email
		}

		const userId = await addLocalUser(userData)

		const accessToken = await signJWT({
			userId,
			isActive: true
		})
		const startingFund = await createStartingFundForUser(userId)
		const funds = [startingFund]

		setAuthCookie(res, accessToken)
		res.status(200).json({ funds } satisfies AllMyFundsResponse)
		void addLoginHistoryRecord(userId)
		return
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error: Unable to Register New User" } satisfies ErrorResponse)
		return
	}
}
