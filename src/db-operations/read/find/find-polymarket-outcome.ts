import PrismaClientClass from "../../../classes/prisma-client"

interface PolymarketOutcome {
	clob_token_id: ClobTokenId
	market: {
		market_id: number
		condition_id: string
		question: string | null
		accepting_orders: boolean
		active: boolean
		closed: boolean
	}
}

export default async function findPolymarketOutcomeById(clobToken: ClobTokenId): Promise<PolymarketOutcome> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const outcome = await prismaClient.polymarket_outcome.findUniqueOrThrow({
			where: { clob_token_id: clobToken },
			select: {
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

		return {
			clob_token_id: outcome.clob_token_id as ClobTokenId,
			market: outcome.market
		} satisfies PolymarketOutcome
	} catch (error) {
		console.error("Error finding user by Id:", error)
		throw error
	}
}
