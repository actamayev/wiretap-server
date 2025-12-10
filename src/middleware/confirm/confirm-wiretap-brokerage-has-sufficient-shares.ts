import { Request, Response, NextFunction } from "express"
import findPosition from "../../db-operations/read/find/find-position"

export default async function confirmWiretapBrokerageHasSufficientShares(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { wiretapFundUuid, numberOfSharesSelling, clobToken } = req.validatedSellOrder

		const position = await findPosition(wiretapFundUuid, clobToken, numberOfSharesSelling)

		if (!position) {
			res.status(400).json({ message: "No position found for this outcome" } satisfies MessageResponse)
			return
		}

		if (position.numberOfSharesHeld < numberOfSharesSelling) {
			res.status(400).json({
				error: `Insufficient shares. You have ${position.numberOfSharesHeld}, trying to sell ${numberOfSharesSelling}`
			} satisfies ErrorResponse)
			return
		}

		req.validatedSellOrder.totalCostOfSharesSelling = position.totalCostOfSharesSelling

		next()
	} catch (error: unknown) {
		console.error("Error in confirmWiretapBrokerageHasSufficientShares middleware:", error)
		res.status(500).json({ error: "Internal Server Error: Unable to verify account balance" } satisfies ErrorResponse)
		return
	}
}
