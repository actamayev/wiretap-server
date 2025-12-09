import { Response, Request } from "express"
import executeBuyOrder from "../../db-operations/write/simultaneous-writes/execute-buy-order"

export default async function buyContract(req: Request, res: Response): Promise<void> {
	try {
		const { wiretapFundUuid, clobToken, numberOfContractsPurchasing, currentPrice } = req.validatedBuyOrder

		// Execute buy order in database transaction
		const result = await executeBuyOrder({
			wiretapFundUuid,
			clobToken,
			numberOfContracts: numberOfContractsPurchasing,
			pricePerContract: currentPrice
		})

		res.status(200).json({
			success: "Buy order executed successfully",
			pricePerContract: currentPrice,
			totalCost: result.totalCost,
			newAccountCashBalance: result.newAccountCashBalance,
			contractsPurchased: numberOfContractsPurchasing
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

		res.status(500).json({ error: "Internal Server Error: Unable to buy contract" } satisfies ErrorResponse)
		return
	}
}
