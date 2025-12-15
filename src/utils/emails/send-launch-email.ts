import { Resend } from "resend"
import { render } from "@react-email/render"
import LaunchEmail from "../../../emails/launch-email"
import SecretsManager from "../../classes/aws/secrets-manager"

export default async function sendLaunchEmail(email: string): Promise<void> {
	try {
		const resendApiKey = await SecretsManager.getInstance().getSecret("RESEND_API_KEY")

		const resend = new Resend(resendApiKey)

		const emailHtml = await render(LaunchEmail())

		const { error } = await resend.emails.send({
			from: "Wiretap <hello@updates.wiretap.pro>",
			replyTo: "hello@wiretap.pro",
			to: [email],
			subject: "Paper trading is live on Wiretap",
			html: emailHtml
		})

		if (error) {
			console.error(`Failed to send launch email to ${email}:`, error)
			throw new Error("Failed to send email")
		}

		console.info(`✅ Sent launch email to ${email}`)
	} catch (error) {
		console.error(`Error sending launch email to ${email}:`, error)
		throw error
	}
}
