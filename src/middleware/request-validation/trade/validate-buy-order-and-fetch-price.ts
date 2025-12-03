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
		const { wiretapBrokerageAccountId, outcomeId, numberOfContractsPurchasing } = req.body as {
			wiretapBrokerageAccountId: number, outcomeId: number, numberOfContractsPurchasing: number
		}

		const validatedBuyOrder: ValidatedBuyOrder = {
			wiretapBrokerageAccountId,
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
