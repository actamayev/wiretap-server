import PrismaClientClass from "../../../classes/prisma-client"

interface PolymarketOutcome {
	outcome_id: number
	clob_token_id: string
	market: {
		market_id: number
		condition_id: string
		question: string | null
		accepting_orders: boolean
		active: boolean
		closed: boolean
	}
}

export default async function findPolymarketOutcomeById(outcomeId: number): Promise<PolymarketOutcome | null> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		return await prismaClient.polymarket_outcome.findUnique({
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
	} catch (error) {
		console.error("Error finding user by Id:", error)
		throw error
	}
}
