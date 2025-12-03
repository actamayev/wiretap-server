import { isNull } from "lodash"
import { Request, Response, NextFunction } from "express"
import fetchPolymarketPrice from "../../../utils/polymarket/fetch-current-price"
import findPosition from "../../../db-operations/read/find/find-position"

export default async function validateSellOrderAndFetchPrice(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { wiretapBrokerageAccountId, outcomeId, numberOfContractsSelling } = req.body as {
			wiretapBrokerageAccountId: number, outcomeId: number, numberOfContractsSelling: number
		}
		const { clobTokenId } = req

		const currentPrice = await fetchPolymarketPrice(clobTokenId)

		if (isNull(currentPrice)) {
			res.status(500).json({ message: "Unable to fetch current market price. Please try again." } satisfies MessageResponse)
			return
		}

		// STEP 4: Verify User Has Position with Sufficient Contracts
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

		// STEP 6: Attach Minimal Data to Request
		req.validatedSellOrder = {
			wiretapBrokerageAccountId,
			outcomeId,
			numberOfContractsSelling,
			currentPrice,
			positionAverageCost: position.averageCostPerContract
		}

		next()
	} catch (error: unknown) {
		console.error("Error in validateSellOrderAndFetchPrice middleware:", error)
		res.status(500).json({ error: "Internal Server Error: Unable to validate sell order" } satisfies ErrorResponse)
		return
	}
}
