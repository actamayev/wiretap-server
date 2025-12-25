import { Request, Response, NextFunction } from "express"
import fetchCurrentTokenPrice from "../../../utils/polymarket/fetch-current-token-midpoint-price"
import { isUndefined } from "lodash"

export default async function validateSellOrderAndFetchPrice(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { clobToken, numberOfSharesSelling } = req.body as { clobToken: ClobTokenId, numberOfSharesSelling: number }

		const currentPrice = await fetchCurrentTokenPrice(clobToken)

		if (isUndefined(currentPrice)) {
			res.status(500).json({ error: "Internal Server Error: Unable to fetch current price" } satisfies ErrorResponse)
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
