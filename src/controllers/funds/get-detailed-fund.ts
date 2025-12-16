import { Request, Response } from "express"
import retrieveDetailedFundData from "../../db-operations/read/retrieve-detailed-fund-data"

export default async function getDetailedFund(req: Request, res: Response): Promise<Response> {
	try {
		const { wiretapFundUuid } = req.params as { wiretapFundUuid: FundsUUID }

		const fund = await retrieveDetailedFundData(wiretapFundUuid)

		return res.status(200).json({ fund } satisfies DetailedSingleFundResponse)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ error: "Internal Server Error: Unable to retrieve user fund data" })
	}
}
