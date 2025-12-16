import { Request, Response } from "express"
import retrievePortfolioSnapshotByResolution from "../../db-operations/read/portfolio-snapshot/retrieve-portfolio-snapshot-by-resolution"

export default async function getPortfolioHistoryByResolution(req: Request, res: Response): Promise<Response> {
	try {
		const { wiretapFundUuid } = req.params as { wiretapFundUuid: FundsUUID }
		const { timeWindow } = req.body as { timeWindow: TimeWindow }

		const portfolioHistory = await retrievePortfolioSnapshotByResolution(wiretapFundUuid, timeWindow)

		return res.status(200).json({ portfolioHistory } satisfies SinglePortfolioSnapshotResponse)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ error: "Internal Server Error: Unable to retrieve user fund data" })
	}
}
