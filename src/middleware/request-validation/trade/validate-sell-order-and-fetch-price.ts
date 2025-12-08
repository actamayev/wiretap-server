import { isNull } from "lodash"
import { Request, Response, NextFunction } from "express"
import fetchPolymarketPrice from "../../../utils/polymarket/fetch-current-price"

export default async function validateSellOrderAndFetchPrice(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { clobToken, numberOfContractsSelling } = req.body as { clobToken: ClobTokenId, numberOfContractsSelling: number }

		const currentPrice = await fetchPolymarketPrice(clobToken)

		if (isNull(currentPrice)) {
			res.status(500).json({ message: "Unable to fetch current market price. Please try again." } satisfies MessageResponse)
			return
		}

		const { wiretapFundUuid } = req.params as { wiretapFundUuid: FundsUUID }

		req.validatedSellOrder = {
			wiretapFundUuid,
			clobToken,
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
