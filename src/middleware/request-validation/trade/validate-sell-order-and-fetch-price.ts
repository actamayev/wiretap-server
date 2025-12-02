import { Request, Response, NextFunction } from "express"
import PrismaClientClass from "../../../classes/prisma-client"
import fetchPolymarketPrice from "../../../utils/polymarket/fetch-current-price"

// eslint-disable-next-line max-lines-per-function
export default async function validateSellOrderAndFetchPrice(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { wiretapBrokerageAccountId, outcomeId, numberOfContracts } = req.body as {
			wiretapBrokerageAccountId: number, outcomeId: number, numberOfContracts: number
		}

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

		// STEP 4: Verify User Has Position with Sufficient Contracts
		const position = await prismaClient.position.findUnique({
			where: {
				wiretap_brokerage_account_id_outcome_id: {
					wiretap_brokerage_account_id: wiretapBrokerageAccountId,
					outcome_id: outcomeId
				}
			},
			select: {
				position_id: true,
				number_contracts_held: true,
				average_cost_per_contract: true
			}
		})

		if (!position) {
			res.status(400).json({ message: "No position found for this outcome" } satisfies MessageResponse)
			return
		}

		if (position.number_contracts_held < numberOfContracts) {
			res.status(400).json({
				error: `Insufficient contracts. You have ${position.number_contracts_held}, trying to sell ${numberOfContracts}`
			} satisfies ErrorResponse)
			return
		}

		// STEP 5: Fetch Current Price from Polymarket
		const currentPrice = await fetchPolymarketPrice(outcome.clob_token_id)

		if (currentPrice === null) {
			res.status(400).json({ message: "Unable to fetch current market price. Please try again." } satisfies MessageResponse)
			return
		}

		// STEP 6: Attach Minimal Data to Request
		req.validatedOrder = {
			wiretapBrokerageAccountId,
			outcomeId,
			numberOfContracts,
			currentPrice,
			positionAverageCost: position.average_cost_per_contract
		}

		next()
	} catch (error: unknown) {
		console.error("Error in validateSellOrderAndFetchPrice middleware:", error)
		res.status(500).json({ error: "Internal Server Error: Unable to validate sell order" } satisfies ErrorResponse)
		return
	}
}
