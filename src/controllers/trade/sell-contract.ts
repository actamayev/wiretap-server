import { Response, Request } from "express"

export default function sellContract(req: Request, res: Response): void {
	try {
		const { userId } = req

		// TODO:
		// Update the contracts held record, and the cash held records
		console.log(userId)

		res.status(200).json({ success: "" } satisfies SuccessResponse)
		return
	} catch (error: unknown) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error: Unable to sell contract" } satisfies ErrorResponse)
		return
	}
}
