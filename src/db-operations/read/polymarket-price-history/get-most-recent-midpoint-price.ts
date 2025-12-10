import PrismaClientClass from "../../../classes/prisma-client"

/**
 * Get the most recent midpoint price for a clob_token_id
 * Used as fallback when price is not in memory cache
 */
export default async function getMostRecentMidpointPrice(clobTokenId: ClobTokenId): Promise<number | null> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const priceRecord = await prismaClient.polymarket_price_history.findFirst({
			where: {
				clob_token_id: clobTokenId,
				midpoint: {
					not: null
				}
			},
			orderBy: {
				timestamp: "desc"
			},
			select: {
				midpoint: true
			}
		})

		return priceRecord?.midpoint ?? null
	} catch (error) {
		console.error(`Error fetching most recent price for ${clobTokenId}:`, error)
		throw error
	}
}
