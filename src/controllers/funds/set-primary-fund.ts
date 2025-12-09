import { Request, Response } from "express"
import updatePrimaryFund from "../../db-operations/read/wiretap-fund/update-primary-fund"
import retrieveFundPositions from "../../db-operations/read/position/retrieve-fund-positions"

export default async function setPrimaryFund(req: Request, res: Response): Promise<Response> {
	try {
		const { userId } = req
		const { wiretapFundUuid } = req.params as { wiretapFundUuid: FundsUUID }
		const { needsPositions } = req.body as { needsPositions: boolean }

		await updatePrimaryFund(userId, wiretapFundUuid)

		if (needsPositions) {
			const positions = await retrieveFundPositions(wiretapFundUuid)
			return res.status(200).json({ positions } satisfies PositionsResponse)
		}

		return res.status(200).json({ success: "Primary fund set successfully" } satisfies SuccessResponse)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ error: "Internal Server Error: Unable to set primary fund" } satisfies ErrorResponse)
	}
}
