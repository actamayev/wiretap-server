import { Request, Response } from "express"
import retrieveSingleFund from "../../db-operations/read/wiretap-fund/retrieve-single-fund"

export default async function getSingleFund(req: Request, res: Response): Promise<Response> {
	try {
		const { wiretapFundUuid } = req.params as { wiretapFundUuid: FundsUUID }

		const singleFund = await retrieveSingleFund(wiretapFundUuid)

		return res.status(200).json({ singleFund } satisfies SingleFundResponse)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ error: "Internal Server Error: Unable to retrieve user fund data" })
	}
}
