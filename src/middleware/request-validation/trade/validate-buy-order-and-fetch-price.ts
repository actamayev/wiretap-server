import { Request, Response, NextFunction } from "express"
import fetchCurrentTokenPrice from "../../../utils/polymarket/fetch-current-token-midpoint-price"

export default async function validateBuyOrderAndFetchPrice(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { clobToken, valueOfSharesPurchasing } = req.body as { clobToken: ClobTokenId, valueOfSharesPurchasing: number }

		const currentPrice = await fetchCurrentTokenPrice(clobToken)

		const { wiretapFundUuid } = req.params as { wiretapFundUuid: FundsUUID }

		const validatedBuyOrder: ValidatedBuyOrder = {
			wiretapFundUuid,
			clobToken,
			numberOfSharesPurchasing: Math.floor(valueOfSharesPurchasing / currentPrice),
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
