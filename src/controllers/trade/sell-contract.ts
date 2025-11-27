import { Response, Request } from "express"
import addEmailUpdateSubscriber from "../../db-operations/write/email-update-subscriber/add-email-update-subscriber"

export default async function sellContract(req: Request, res: Response): Promise<void> {
	try {
		const { userId } = req

		// TODO:
		// Update the contracts held record, and the cash held records
		await addEmailUpdateSubscriber(email)

		res.status(200).json({ success: "" } satisfies SuccessResponse)
		return
	} catch (error: unknown) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error: Unable to sell contract" } satisfies ErrorResponse)
		return
	}
}
