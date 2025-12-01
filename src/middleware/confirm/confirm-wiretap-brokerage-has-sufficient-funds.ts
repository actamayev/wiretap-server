import { Request, Response, NextFunction } from "express"
import retrieveBrokerageAccountBalance from "../../db-operations/read/wiretap-brokerage-account/retrieve-brokerage-account-balance"
import { isUndefined } from "lodash"

export default async function confirmUserHasSufficientFundsToPurchaseContracts(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response | void> {
	try {
		const { wiretapBrokerageAccountId } = req.params as { wiretapBrokerageAccountId: string }
		const { contractUUID, numberContractsPurchasing, yesOrNo } = req.body
		const balanceInUsd = await retrieveBrokerageAccountBalance(parseInt(wiretapBrokerageAccountId, 10))

		if (isUndefined(balanceInUsd)) {
			return res.status(400).json({ message: "Cannot find user's brokerage accounts" })
		}

		//1. Find the current, real-time price of the contract the user is trying to purchase (hit the api!) from the contractUUID and yesOrNo
		//2. Calculate what it'll cost the user
		//3. See if the user has enough

		const totalContractPrice = 0
		if (balanceInUsd < totalContractPrice) {
			return res.status(400).json({ message: "User does not have sufficient Sol to complete the purchase" })
		}

		next()
	} catch (error) {
		console.error(error)
		return res.status(500).json({
			error: "Internal Server Error: Unable to Check if User has sufficient Sol to purchase exclusive content"
		})
	}
}
