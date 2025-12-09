import { Request, Response, NextFunction } from "express"
import findPolymarketOutcomeById from "../../../db-operations/read/find/find-polymarket-outcome"

export default async function validateOutcomeValid(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { clobToken } = req.body as { clobToken: ClobTokenId }

		const { market } = await findPolymarketOutcomeById(clobToken)

		if (!market.active) {
			res.status(400).json({ message: `Market "${market.question}" is not active` } satisfies MessageResponse)
			return
		}

		if (market.closed) {
			res.status(400).json({ message: `Market "${market.question}" is closed` } satisfies MessageResponse)
			return
		}

		if (!market.accepting_orders) {
			res.status(400).json({ message: `Market "${market.question}" is not accepting orders` } satisfies MessageResponse)
			return
		}

		next()
	} catch (error: unknown) {
		console.error("Error in validateBuyOrderAndFetchPrice middleware:", error)
		res.status(500).json({ error: "Internal Server Error: Unable to validate buy order" } satisfies ErrorResponse)
		return
	}
}
