import isNull from "lodash/isNull"
import { Response, Request } from "express"
import Hash from "../../classes/hash"
import Encryptor from "../../classes/encryptor"
import signJWT from "../../utils/auth-helpers/jwt/sign-jwt"
import { setAuthCookie } from "../../middleware/cookie-helpers"
import determineLoginContactType from "../../utils/auth-helpers/determine-contact-type"
import retrieveUserFromContact from "../../utils/auth-helpers/login/retrieve-user-from-contact"
import addLoginHistoryRecord from "../../db-operations/write/login-history/add-login-history-record"

export default async function login(req: Request, res: Response): Promise<void> {
	try {
		const { contact, password } = req.body.loginInformation as IncomingLoginRequest
		const loginContactType = determineLoginContactType(contact)

		const credentialsResult = await retrieveUserFromContact(contact, loginContactType)
		if (isNull(credentialsResult)) {
			res.status(400).json(
				{ message: `There is no Wiretap account associated with ${contact}. Please try again.` } satisfies MessageResponse
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
			username: credentialsResult.username, // NEW: Add username to JWT
			isActive: true // Optional: add user status
		})

		const encryptor = new Encryptor()
		const email = await encryptor.deterministicDecrypt(credentialsResult.email__encrypted, "EMAIL_ENCRYPTION_KEY")

		setAuthCookie(res, accessToken)

		res.status(200).json({
			username: credentialsResult.username as string,
			email,
		} satisfies BasicPersonalInfoResponse)
		void addLoginHistoryRecord(credentialsResult.user_id)
		return
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error: Unable to Login" } satisfies ErrorResponse)
		return
	}
}
