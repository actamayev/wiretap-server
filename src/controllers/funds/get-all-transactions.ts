import { Request, Response } from "express"
import retrieveAllContracts from "../../db-operations/read/wiretap-brokerage-account/retrieve-all-transactions"
import { isNull } from "lodash"
import transformRawUserTransactions from "../../utils/transform/transform-raw-user-transactions"

export default async function getAllTransactions(req: Request, res: Response): Promise<Response> {
	try {
		const { wiretapFundUuid } = req

		const rawUserTransactions = await retrieveAllContracts(wiretapFundUuid)
		if (isNull(rawUserTransactions)) {
			return res.status(400).json({ message: "Unable to find your account" } satisfies MessageResponse)
		}
		const transactions = transformRawUserTransactions(rawUserTransactions)

		return res.status(200).json({ ...transactions } satisfies TransactionResponse)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ error: "Internal Server Error: Unable to Retrieve my ownership" })
	}
}
