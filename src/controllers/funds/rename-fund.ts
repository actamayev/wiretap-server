import { Request, Response } from "express"
import renameWiretapFund from "../../db-operations/write/wiretap-fund/rename-fund"

export default async function renameFund(req: Request, res: Response): Promise<Response> {
	try {
		const { wiretapFundUuid } = req.params as { wiretapFundUuid: FundsUUID }
		const { newFundName } = req.body

		await renameWiretapFund(wiretapFundUuid, newFundName)

		return res.status(200).json({ success: "Fund renamed successfully" } satisfies SuccessResponse)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ error: "Internal Server Error: Unable to rename fund" })
	}
}
