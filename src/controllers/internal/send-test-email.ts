import { Resend } from "resend"
import { Response, Request } from "express"
import { render } from "@react-email/render"
import WelcomeEmail from "../../emails/subscribe-for-updates-email"
import SecretsManager from "../../classes/aws/secrets-manager"

export default async function sendTestEmail(req: Request, res: Response): Promise<void> {
	try {
		const { email } = req.body as { email: string }

		const resendApiKey = await SecretsManager.getInstance().getSecret("RESEND_API_KEY")

		const resend = new Resend(resendApiKey)

		const emailHtml = await render(WelcomeEmail())

		const { error } = await resend.emails.send({
			from: "Ariel Tamayev <ariel@updates.wiretap.pro>",
			replyTo: "hello@wiretap.pro",
			to: [email],
			subject: "Welcome to Wiretap",
			html: emailHtml
		})

		if (error) {
			console.error(error)
			res.status(500).json({ error: "Failed to send email" } satisfies ErrorResponse)
			return
		}

		res.status(200).json({ success: "Test email sent" } satisfies SuccessResponse)
		return
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error: Unable to send email" } satisfies ErrorResponse)
		return
	}
}
