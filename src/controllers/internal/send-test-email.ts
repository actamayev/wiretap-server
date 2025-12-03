import { Response, Request } from "express"
import sendNewUserEmail from "../../utils/emails/send-new-user-email"

export default async function sendTestEmail(req: Request, res: Response): Promise<void> {
	try {
		const { email } = req.body as { email: string }

		await sendNewUserEmail(email)

		res.status(200).json({ success: "" } satisfies SuccessResponse)
		return
	} catch (error: unknown) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error: Unable to send test email" } satisfies ErrorResponse)
		return
	}
}
