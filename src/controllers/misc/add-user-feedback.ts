import { Response, Request } from "express"
import createUserFeedback from "../../db-operations/write/feedback/create-user-feedback"

export default async function addUserFeedback (req: Request, res: Response): Promise<void> {
	try {
		const { userId } = req
		const { feedback } = req.body as { feedback: string }

		await createUserFeedback(userId, feedback)

		res.status(200).json({ success: "" } satisfies SuccessResponse)
		return
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error: Unable to add user feedback"} satisfies ErrorResponse)
		return
	}
}
