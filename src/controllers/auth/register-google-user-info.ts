import isNull from "lodash/isNull"
import { Response, Request } from "express"
import Encryptor from "../../classes/encryptor"
import signJWT from "../../utils/auth-helpers/jwt/sign-jwt"
import { setAuthCookie } from "../../middleware/cookie-helpers"
import doesUsernameExist from "../../db-operations/read/does-x-exist/does-username-exist"
import setUsername from "../../db-operations/write/credentials/set-username-and-age"

export default async function registerGoogleInfo(req: Request, res: Response): Promise<void> {
	try {
		const { user } = req
		if (!isNull(user.username)) {
			res.status(400).json({ message: "You've already registered a username for this account" } satisfies MessageResponse)
			return
		}
		const { username } = req.body.newGoogleInfo as { username: string }
		const usernameExists = await doesUsernameExist(username)
		if (usernameExists === true) {
			res.status(400).json({ message: "Username already taken" } satisfies MessageResponse)
			return
		}

		await setUsername(user.user_id, username)
		const newAccessToken = await signJWT({
			userId: user.user_id,
			username,  // Now has the username!
			isActive: true
		})

		// ✅ ADD: Update the cookie with new JWT
		setAuthCookie(res, newAccessToken)

		const encryptor = new Encryptor()
		const email = await encryptor.deterministicDecrypt(user.email__encrypted, "EMAIL_ENCRYPTION_KEY")

		res.status(200).json({ email } satisfies EmailResponse)
		return
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error: Unable to register username" } satisfies ErrorResponse)
		return
	}
}
