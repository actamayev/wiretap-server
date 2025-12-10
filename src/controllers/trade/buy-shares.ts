import { Response, Request } from "express"
import executeBuyOrder from "../../db-operations/write/simultaneous-writes/execute-buy-order"
import retrievePolymarketOutcomeDataForTrade
	from "../../db-operations/read/polymarket-outcome/retrieve-polymarket-outcome-data-for-trade"

// eslint-disable-next-line max-lines-per-function
export default async function buyShares(req: Request, res: Response): Promise<void> {
	try {
		const { wiretapFundUuid, clobToken, numberOfSharesPurchasing, currentPrice } = req.validatedBuyOrder

		// Execute buy order in database transaction
		const { position, newAccountCashBalance } = await executeBuyOrder({
			wiretapFundUuid,
			clobToken,
			numberOfSharesPurchasing,
			pricePerShare: currentPrice
		})

		const outcomeData = await retrievePolymarketOutcomeDataForTrade(clobToken)

		res.status(200).json({
			success: "Buy order executed successfully",
			position: {
				clobToken: position.clob_token_id as ClobTokenId,
				outcome: outcomeData.outcome,
				marketQuestion: outcomeData.marketQuestion,
				numberOfSharesHeld: position.number_shares_held,
				costBasisPerShareUsd: position.average_cost_per_share,
				currentMarketPricePerShareUsd: currentPrice,
				positionCreatedAt: position.created_at,
				polymarketSlug: outcomeData.polymarketSlug,
				polymarketImageUrl: outcomeData.polymarketImageUrl
			},
			newAccountCashBalance
		} satisfies SuccessBuyOrderResponse)
		return
	} catch (error: unknown) {
		console.error("Error executing buy order:", error)

		// Handle specific error cases
		if (error instanceof Error) {
			if (error.message.includes("Insufficient funds")) {
				res.status(500).json({error: error.message} satisfies ErrorResponse)
				return
			}

			if (error.message.includes("not found")) {
				res.status(500).json({ error: error.message } satisfies ErrorResponse)
				return
			}
		}

		res.status(500).json({ error: "Internal Server Error: Unable to buy shares" } satisfies ErrorResponse)
		return
	}
}
