import { isNull } from "lodash"
import { Request, Response, NextFunction } from "express"
import fetchPolymarketPrice from "../../../utils/polymarket/fetch-current-price"

export default async function validateSellOrderAndFetchPrice(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { clobTokenId } = req

		const currentPrice = await fetchPolymarketPrice(clobTokenId)

		if (isNull(currentPrice)) {
			res.status(500).json({ message: "Unable to fetch current market price. Please try again." } satisfies MessageResponse)
			return
		}

		const { wiretapBrokerageAccountId } = req.params as { wiretapBrokerageAccountId: string }
		const { outcomeId, numberOfContractsSelling } = req.body as { outcomeId: number, numberOfContractsSelling: number }
		const parsedWiretapBrokerageAccountId = parseInt(wiretapBrokerageAccountId, 10)

		req.validatedSellOrder = {
			wiretapBrokerageAccountId: parsedWiretapBrokerageAccountId,
			outcomeId,
			numberOfContractsSelling,
			currentPrice,
			positionAverageCost: 0
		}

		next()
	} catch (error: unknown) {
		console.error("Error in validateSellOrderAndFetchPrice middleware:", error)
		res.status(500).json({ error: "Internal Server Error: Unable to validate sell order" } satisfies ErrorResponse)
		return
	}
}
