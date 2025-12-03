import isNull from "lodash/isNull"
import { Request, Response, NextFunction } from "express"
import fetchPolymarketPrice from "../../../utils/polymarket/fetch-current-price"

export default async function validateBuyOrderAndFetchPrice(
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
		const { outcomeId, numberOfContractsPurchasing } = req.body as { outcomeId: number, numberOfContractsPurchasing: number }
		const parsedWiretapBrokerageAccountId = parseInt(wiretapBrokerageAccountId, 10)

		if (isNaN(parsedWiretapBrokerageAccountId)) {
			res.status(400).json({ message: "Invalid wiretap brokerage account id" } satisfies MessageResponse)
			return
		}

		const validatedBuyOrder: ValidatedBuyOrder = {
			wiretapBrokerageAccountId: parsedWiretapBrokerageAccountId,
			outcomeId,
			numberOfContractsPurchasing,
			currentPrice,
		}

		req.validatedBuyOrder = validatedBuyOrder

		next()
	} catch (error: unknown) {
		console.error("Error in validateBuyOrderAndFetchPrice middleware:", error)
		res.status(500).json({ error: "Internal Server Error: Unable to validate buy order" } satisfies ErrorResponse)
		return
	}
}
