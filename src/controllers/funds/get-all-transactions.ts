import { Request, Response } from "express"
import retrieveAllTransactions from "../../db-operations/read/wiretap-fund/retrieve-all-transactions"
import isNull from "lodash/isNull"

export default async function getAllTransactions(req: Request, res: Response): Promise<Response> {
	try {
		const { wiretapFundUuid } = req.params as { wiretapFundUuid: FundsUUID }

		const transactions = await retrieveAllTransactions(wiretapFundUuid)
		if (isNull(transactions)) {
			return res.status(400).json({ message: "Unable to find your account" } satisfies MessageResponse)
		}

		return res.status(200).json({ ...transactions } satisfies TransactionResponse)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ error: "Internal Server Error: Unable to retrieve user transactions" })
	}
}
