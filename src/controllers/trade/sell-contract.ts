import { Response, Request } from "express"
import executeSellOrder from "../../db-operations/write/simultaneous-writes/execute-sell-order"

export default async function sellContract(req: Request, res: Response): Promise<void> {
	try {
		const { wiretapBrokerageAccountId, outcomeId, numberOfContractsSelling, currentPrice, positionAverageCost } = req.validatedSellOrder

		// Execute sell order in database transaction
		const result = await executeSellOrder({
			wiretapBrokerageAccountId,
			outcomeId,
			numberOfContractsSelling,
			pricePerContract: currentPrice,
			positionAverageCost
		})

		res.status(200).json({
			success: "Sell order executed successfully",
			saleId: result.saleId,
			positionClosed: result.positionClosed,
			contractsSold: numberOfContractsSelling,
			pricePerContract: currentPrice,
			totalProceeds: result.totalProceeds,
			realizedPnl: result.realizedPnl,
			newAccountBalance: result.newAccountBalance
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

		res.status(500).json({ error: "Internal Server Error: Unable to sell contract" } satisfies ErrorResponse)
		return
	}
}
