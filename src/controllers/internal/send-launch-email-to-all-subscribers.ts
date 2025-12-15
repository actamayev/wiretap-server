import { Response, Request } from "express"
import sendLaunchEmail from "../../utils/emails/send-launch-email"
import retrieveAllEmailSubscribers from "../../db-operations/read/email-update-subscriber/retrieve-all-email-subscribers"

export default async function sendLaunchEmailToAllSubscribers(_req: Request, res: Response): Promise<void> {
	try {
		// Retrieve all subscribers from database
		const emails = await retrieveAllEmailSubscribers()
		console.info(`📧 Found ${emails.length} email subscribers`)

		// Send response immediately so the request doesn't timeout
		res.status(200).json({
			success: `Started sending ${emails.length} launch emails (1 per second)`
		} satisfies SuccessResponse)

		// Send emails one per second
		let sentCount = 0
		let failedCount = 0

		for (const email of emails) {
			try {
				await sendLaunchEmail(email)
				sentCount++
			} catch (error) {
				console.error(`Failed to send email to ${email}:`, error)
				failedCount++
			}

			// Wait 1 second before sending the next email (except for the last one)
			if (email !== emails[emails.length - 1]) {
				await new Promise(resolve => setTimeout(resolve, 1000))
			}
		}

		console.info(`📧 Launch email campaign complete: ${sentCount} sent, ${failedCount} failed`)
	} catch (error) {
		console.error("Error in sendLaunchEmailToAllSubscribers:", error)
		// Response already sent, so just log the error
	}
}
