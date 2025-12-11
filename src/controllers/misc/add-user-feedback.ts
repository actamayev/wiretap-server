import { Response, Request } from "express"
import createUserFeedback from "../../db-operations/write/feedback/create-user-feedback"
import { findUserById } from "../../db-operations/read/find/find-user"
import sendFeedbackEmail from "../../utils/emails/send-feedback-email"

export default async function addUserFeedback (req: Request, res: Response): Promise<void> {
	try {
		const { userId } = req
		const { feedback } = req.body as { feedback: string }

		await createUserFeedback(userId, feedback)

		// Send email notification (don't block response if email fails)
		try {
			const user = await findUserById(userId)
			if (user) {
				await sendFeedbackEmail({
					username: user.username,
					userEmail: user.email,
					feedback
				})
			}
		} catch (emailError) {
			console.error("Failed to send feedback email notification:", emailError)
			// Don't fail the request if email fails
		}

		res.status(200).json({ success: "" } satisfies SuccessResponse)
		return
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error: Unable to add user feedback"} satisfies ErrorResponse)
		return
	}
}
