import { Request, Response } from "express"
import updatePrimaryFund from "../../db-operations/read/wiretap-fund/update-primary-fund"

export default async function setPrimaryFund(req: Request, res: Response): Promise<Response> {
	try {
		const { userId } = req
		const { wiretapFundUuid } = req.params as { wiretapFundUuid: FundsUUID }

		await updatePrimaryFund(userId, wiretapFundUuid)

		return res.status(200).json({ success: "Primary fund set successfully" } satisfies SuccessResponse)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ error: "Internal Server Error: Unable to set primary fund" } satisfies ErrorResponse)
	}
}
