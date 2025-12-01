import { Response, Request } from "express"

export default function buyContract(req: Request, res: Response): void {
	try {
		const { userId } = req

		// TODO
		//Do the following as part of one prisma transaction:
		//1. Decrement cash in wiretap_brokerage_account
		// (when doing this, ensure the final amount is greater than 0 (double-safety since we already have the confirm funds middleware))
		//2. Create purchase order record
		//3. Upsert to positions table

		console.log(userId)

		res.status(200).json({ success: "" } satisfies SuccessResponse)
		return
	} catch (error: unknown) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error: Unable to buy contract" } satisfies ErrorResponse)
		return
	}
}
