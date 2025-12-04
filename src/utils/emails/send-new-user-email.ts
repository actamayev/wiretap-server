import { Resend } from "resend"
import { render } from "@react-email/render"
import WelcomeEmail from "../../../emails/welcome-email"
import SecretsManager from "../../classes/aws/secrets-manager"

export default async function sendNewUserEmail(email: string): Promise<void> {
	try {
		const resendApiKey = await SecretsManager.getInstance().getSecret("RESEND_API_KEY")

		const resend = new Resend(resendApiKey)

		const emailHtml = await render(WelcomeEmail())

		const { error } = await resend.emails.send({
			from: "Wiretap <hello@updates.wiretap.pro>",
			replyTo: "hello@wiretap.pro",
			to: [email],
			subject: "Welcome to Wiretap",
			html: emailHtml
		})

		if (error) {
			console.error(error)
			throw new Error("Failed to send email")
		}
	} catch (error) {
		console.error(error)
		throw new Error("Internal Server Error: Unable to send email")
	}
}
