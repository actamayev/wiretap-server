import { isUndefined } from "lodash"
import { Request, Response, NextFunction } from "express"
import retrieveCurrentAccountBalance from "../../db-operations/read/wiretap-fund/retrieve-current-account-balance"

export default async function confirmWiretapBrokerageHasSufficientFunds(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { wiretapFundUuid, numberOfContractsPurchasing, currentPrice } = req.validatedBuyOrder

		// Calculate total cost
		const totalCost = currentPrice * numberOfContractsPurchasing

		// Fetch account balance
		const currentAccountBalance = await retrieveCurrentAccountBalance(wiretapFundUuid)

		if (isUndefined(currentAccountBalance)) {
			res.status(500).json({ error: `Brokerage account ${wiretapFundUuid} not found` } satisfies ErrorResponse)
			return
		}

		// Check if user has sufficient funds
		if (currentAccountBalance < totalCost) {
			res.status(400).json({
				message: `Insufficient funds. Balance: $${currentAccountBalance.toFixed(2)}, Required: $${totalCost.toFixed(2)}`
			} satisfies MessageResponse)
			return
		}

		next()
	} catch (error: unknown) {
		console.error("Error in confirmWiretapBrokerageHasSufficientFunds middleware:", error)
		res.status(500).json({ error: "Internal Server Error: Unable to verify account balance" } satisfies ErrorResponse)
		return
	}
}
