import { Request, Response } from "express"
import createWiretapFund from "../../db-operations/write/wiretap-fund/create-wiretap-fund"

export default async function createFund(req: Request, res: Response): Promise<Response> {
	try {
		const { userId } = req
		const { fundName, startingAccountBalanceUsd } = req.body.fundInformation as IncomingCreateFundRequest

		const newFundUUID = await createWiretapFund(userId, fundName, startingAccountBalanceUsd)

		return res.status(200).json({ fundUUID: newFundUUID } satisfies CreateFundResponse)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ error: "Internal Server Error: Unable to create fund" })
	}
}
