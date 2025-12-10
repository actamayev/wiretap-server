import { isNull } from "lodash"
import { Request, Response, NextFunction } from "express"
import fetchPolymarketPrice from "../../../utils/polymarket/fetch-current-price"

export default async function validateSellOrderAndFetchPrice(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { clobToken, numberOfSharesSelling } = req.body as { clobToken: ClobTokenId, numberOfSharesSelling: number }

		const currentPrice = await fetchPolymarketPrice(clobToken)

		if (isNull(currentPrice)) {
			res.status(500).json({ message: "Unable to fetch current market price. Please try again." } satisfies MessageResponse)
			return
		}

		const { wiretapFundUuid } = req.params as { wiretapFundUuid: FundsUUID }

		const validatedSellOrder: ValidatedSellOrder = {
			wiretapFundUuid,
			clobToken,
			numberOfSharesSelling,
			currentPrice,
			totalCostOfSharesSelling: 0
		}

		req.validatedSellOrder = validatedSellOrder

		next()
	} catch (error: unknown) {
		console.error("Error in validateSellOrderAndFetchPrice middleware:", error)
		res.status(500).json({ error: "Internal Server Error: Unable to validate sell order" } satisfies ErrorResponse)
		return
	}
}
