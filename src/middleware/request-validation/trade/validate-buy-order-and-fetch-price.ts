import { Request, Response, NextFunction } from "express"
import PrismaClientClass from "../../../classes/prisma-client"
import fetchPolymarketPrice from "../../../utils/polymarket/fetch-current-price"

// eslint-disable-next-line max-lines-per-function
export default async function validateBuyOrderAndFetchPrice(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		// eslint-disable-next-line max-len
		const { wiretapBrokerageAccountId, outcomeId, numberOfContracts } = req.body as { wiretapBrokerageAccountId: number, outcomeId: number, numberOfContracts: number }

		// STEP 2: Fetch Outcome with Market (minimal select)
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const outcome = await prismaClient.polymarket_outcome.findUnique({
			where: { outcome_id: outcomeId },
			select: {
				outcome_id: true,
				clob_token_id: true,
				market: {
					select: {
						market_id: true,
						condition_id: true,
						question: true,
						active: true,
						closed: true,
						accepting_orders: true
					}
				}
			}
		})

		if (!outcome) {
			res.status(500).json({ error: `Outcome with id ${outcomeId} not found` } satisfies ErrorResponse)
			return
		}

		// STEP 3: Validate Market State
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

		// STEP 4: Fetch Current Price from Polymarket
		const currentPrice = await fetchPolymarketPrice(outcome.clob_token_id)

		if (currentPrice === null) {
			res.status(500).json({ message: "Unable to fetch current market price. Please try again." } satisfies MessageResponse)
			return
		}

		// STEP 5: Attach Minimal Data to Request
		req.validatedOrder = {
			wiretapBrokerageAccountId,
			outcomeId,
			numberOfContracts,
			currentPrice,
		}

		next()

	} catch (error: unknown) {
		console.error("Error in validateBuyOrderAndFetchPrice middleware:", error)
		res.status(500).json({
			error: "Internal Server Error: Unable to validate buy order"
		} satisfies ErrorResponse)
		return
	}
}
