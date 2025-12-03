import isNull from "lodash/isNull"
import { Request, Response, NextFunction } from "express"
import findPolymarketOutcomeById from "../../../db-operations/read/find/find-polymarket-outcome"

export default async function validateOutcomeValid(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { outcomeId } = req.body as { outcomeId: number }

		const outcome = await findPolymarketOutcomeById(outcomeId)

		if (isNull(outcome)) {
			res.status(500).json({ error: `Outcome with id ${outcomeId} not found` } satisfies ErrorResponse)
			return
		}

		const { market } = outcome

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

		req.clobTokenId = outcome.clob_token_id

		next()
	} catch (error: unknown) {
		console.error("Error in validateBuyOrderAndFetchPrice middleware:", error)
		res.status(500).json({ error: "Internal Server Error: Unable to validate buy order" } satisfies ErrorResponse)
		return
	}
}
