// import { Response, Request } from "express"
// import retrieveAllEmailSubscribers from "../../db-operations/read/email-update-subscriber/retrieve-all-email-subscribers"
// import sendLaunchEmail from "../../utils/emails/send-launch-email"

// export default async function sendLaunchEmailToAllSubscribers(_req: Request, res: Response): Promise<void> {
// 	try {
// 		// Retrieve all subscribers from database
// 		const encryptedEmails = await retrieveAllEmailSubscribers()
// 		console.log(`📧 Found ${encryptedEmails.length} email subscribers`)

// 		// Decode emails
// 		const decodedEmails: string[] = []

// 		for (const encryptedEmail of encryptedEmails) {
// 			try {
// 				decodedEmails.push(encryptedEmail)
// 			} catch (error) {
// 				console.error("Failed to decrypt email for subscriber:", error)
// 				// Continue with other emails even if one fails
// 			}
// 		}

// 		console.log(`✅ Decoded ${decodedEmails.length} emails`)

// 		// Send response immediately so the request doesn't timeout
// 		res.status(200).json({
// 			success: `Started sending ${decodedEmails.length} launch emails (1 per second)`
// 		} satisfies SuccessResponse)

// 		// Send emails one per second
// 		let sentCount = 0
// 		let failedCount = 0

// 		for (const email of decodedEmails) {
// 			try {
// 				await sendLaunchEmail(email)
// 				sentCount++
// 			} catch (error) {
// 				console.error(`Failed to send email to ${email}:`, error)
// 				failedCount++
// 			}

// 			// Wait 1 second before sending the next email (except for the last one)
// 			if (email !== decodedEmails[decodedEmails.length - 1]) {
// 				await new Promise(resolve => setTimeout(resolve, 1000))
// 			}
// 		}

// 		console.log(`📧 Launch email campaign complete: ${sentCount} sent, ${failedCount} failed`)
// 	} catch (error) {
// 		console.error("Error in sendLaunchEmailToAllSubscribers:", error)
// 		// Response already sent, so just log the error
// 	}
// }
