import { Resend } from "resend"
import { render } from "@react-email/render"
import FeedbackEmail from "../../../emails/feedback-email"
import SecretsManager from "../../classes/aws/secrets-manager"

interface FeedbackEmailData {
	username: string | null
	userEmail: string
	feedback: string
}

export default async function sendFeedbackEmail(data: FeedbackEmailData): Promise<void> {
	try {
		const resendApiKey = await SecretsManager.getInstance().getSecret("RESEND_API_KEY")

		const resend = new Resend(resendApiKey)

		const emailHtml = await render(FeedbackEmail(data))

		const { error } = await resend.emails.send({
			from: "Wiretap <hello@updates.wiretap.pro>",
			replyTo: data.userEmail,
			to: ["hello@wiretap.pro"],
			subject: `New Wiretap Feedback from ${data.username || data.userEmail}`,
			html: emailHtml
		})

		if (error) {
			console.error("Failed to send feedback email:", error)
			throw new Error("Failed to send email")
		}

		console.log("✅ Sent feedback email to hello@wiretap.pro")
	} catch (error) {
		console.error("Error sending feedback email:", error)
		throw error
	}
}
