import { Response, Request } from "express"
import executeSellOrder from "../../db-operations/write/simultaneous-writes/execute-sell-order"
import retrieveSpecificClobPositions from "../../db-operations/read/position/retrieve-specific-clob-positions"

export default async function sellContract(req: Request, res: Response): Promise<void> {
	try {
		const { wiretapFundUuid, clobToken, numberOfContractsSelling, currentPrice, totalCostOfContractsSelling } = req.validatedSellOrder

		// Execute sell order in database transaction
		const result = await executeSellOrder({
			wiretapFundUuid,
			clobToken,
			numberOfContractsSelling,
			pricePerContract: currentPrice,
			totalCostOfContractsSelling
		})

		const remainingPositions = await retrieveSpecificClobPositions(wiretapFundUuid, clobToken)

		res.status(200).json({
			success: "Sell order executed successfully",
			saleId: result.saleId,
			positionClosed: result.positionClosed,
			contractsSold: numberOfContractsSelling,
			pricePerContract: currentPrice,
			totalProceeds: result.totalProceeds,
			realizedPnl: result.realizedPnl,
			newAccountCashBalance: result.newAccountCashBalance,
			remainingPositions: remainingPositions
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
