import { Request, Response } from "express"
import { AuthMethods } from "../../generated/prisma/client"

export default function getPersonalInfo(req: Request, res: Response): void {
	try {
		const { user } = req

		res.status(200).json({
			email: user.email,
			isGoogleUser: user.auth_method === AuthMethods.GOOGLE
		} satisfies BasicPersonalInfoResponse)
		return
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error: Unable to retrieve personal info" } satisfies ErrorResponse)
		return
	}
}
