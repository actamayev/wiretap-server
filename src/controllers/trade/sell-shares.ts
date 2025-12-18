import { Response, Request } from "express"
import executeSellOrder from "../../db-operations/write/simultaneous-writes/execute-sell-order"
import retrieveSpecificClobPositions from "../../db-operations/read/position/retrieve-specific-clob-positions"
import retrievePolymarketOutcomeDataForTrade from "../../db-operations/read/polymarket-outcome/retrieve-polymarket-outcome-data-for-trade"

// eslint-disable-next-line max-lines-per-function
export default async function sellShares(req: Request, res: Response): Promise<void> {
	try {
		const { wiretapFundUuid, clobToken, numberOfSharesSelling, currentPrice, totalCostOfSharesSelling } = req.validatedSellOrder

		// Execute sell order in database transaction
		const result = await executeSellOrder({
			wiretapFundUuid,
			clobToken,
			numberOfSharesSelling,
			pricePerShare: currentPrice,
			totalCostOfSharesSelling
		})

		const remainingPositions = await retrieveSpecificClobPositions(wiretapFundUuid, clobToken)

		const outcomeData = await retrievePolymarketOutcomeDataForTrade(clobToken)

		res.status(200).json({
			success: "Sell order executed successfully",
			saleId: result.saleId,
			positionClosed: result.positionClosed,
			numberOfSharesSold: numberOfSharesSelling,
			pricePerShare: currentPrice,
			totalProceeds: result.totalProceeds,
			realizedPnl: result.realizedPnl,
			newAccountCashBalance: result.newAccountCashBalance,
			remainingPositions,
			outcomeData: {
				outcome: outcomeData.outcome,
				marketQuestion: outcomeData.marketQuestion,
				groupItemTitle: outcomeData.groupItemTitle,
				polymarketSlug: outcomeData.polymarketSlug,
				polymarketImageUrl: outcomeData.polymarketImageUrl
			}
		} satisfies SuccessSellOrderResponse)
		return
	} catch (error: unknown) {
		console.error("Error executing sell order:", error)

		// Handle specific error cases
		if (error instanceof Error) {
			if (error.message.includes("Position not found")) {
				res.status(404).json({ error: error.message } satisfies ErrorResponse)
				return
			}

			if (error.message.includes("not found")) {
				res.status(404).json({ error: error.message } satisfies ErrorResponse)
				return
			}
		}

		res.status(500).json({ error: "Internal Server Error: Unable to sell shares" } satisfies ErrorResponse)
		return
	}
}
