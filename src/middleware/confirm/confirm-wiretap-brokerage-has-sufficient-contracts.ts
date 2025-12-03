import { Request, Response, NextFunction } from "express"
import findPosition from "../../db-operations/read/find/find-position"

export default async function confirmWiretapBrokerageHasSufficientContracts(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { wiretapBrokerageAccountId, numberOfContractsSelling, outcomeId } = req.validatedSellOrder

		const position = await findPosition(wiretapBrokerageAccountId, outcomeId)

		if (!position) {
			res.status(400).json({ message: "No position found for this outcome" } satisfies MessageResponse)
			return
		}

		if (position.numberOfContractsHeld < numberOfContractsSelling) {
			res.status(400).json({
				error: `Insufficient contracts. You have ${position.numberOfContractsHeld}, trying to sell ${numberOfContractsSelling}`
			} satisfies ErrorResponse)
			return
		}

		req.validatedSellOrder.positionAverageCost = position.averageCostPerContract

		next()
	} catch (error: unknown) {
		console.error("Error in confirmWiretapBrokerageHasSufficientContracts middleware:", error)
		res.status(500).json({ error: "Internal Server Error: Unable to verify account balance" } satisfies ErrorResponse)
		return
	}
}
