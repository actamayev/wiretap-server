import { isNull } from "lodash"
import { Request, Response, NextFunction } from "express"
import PriceTracker from "../../../classes/price-tracker"

export default function validateSellOrderAndFetchPrice(
	req: Request,
	res: Response,
	next: NextFunction
): void {
	try {
		const { clobToken, numberOfSharesSelling } = req.body as { clobToken: ClobTokenId, numberOfSharesSelling: number }

		const currentPrice = PriceTracker.getInstance().getBestBid(clobToken) ?? 0

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
