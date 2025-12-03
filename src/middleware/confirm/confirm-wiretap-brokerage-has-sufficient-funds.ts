import { isUndefined } from "lodash"
import { Request, Response, NextFunction } from "express"
import retrieveCurrentAccountBalance from "../../db-operations/read/wiretap-brokerage-account/retrieve-current-account-balance"

export default async function confirmWiretapBrokerageHasSufficientFunds(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { validatedBuyOrder } = req

		const {
			wiretapBrokerageAccountId,
			numberOfContractsPurchasing,
			currentPrice
		} = validatedBuyOrder

		// Calculate total cost
		const totalCost = currentPrice * numberOfContractsPurchasing

		// Fetch account balance
		const currentAccountBalance = await retrieveCurrentAccountBalance(wiretapBrokerageAccountId)

		if (isUndefined(currentAccountBalance)) {
			res.status(500).json({ error: `Brokerage account ${wiretapBrokerageAccountId} not found` } satisfies ErrorResponse)
			return
		}

		// Check if user has sufficient funds
		if (currentAccountBalance < totalCost) {
			res.status(400).json({
				error: `Insufficient funds. Balance: $${currentAccountBalance.toFixed(2)}, Required: $${totalCost.toFixed(2)}`
			} satisfies ErrorResponse)
			return
		}

		next()
	} catch (error: unknown) {
		console.error("Error in confirmWiretapBrokerageHasSufficientFunds middleware:", error)
		res.status(500).json({
			error: "Internal Server Error: Unable to verify account balance"
		} satisfies ErrorResponse)
		return
	}
}
