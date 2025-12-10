import PrismaClientClass from "../../../classes/prisma-client"

/**
 * Get all clob_token_ids from active, non-closed markets
 * Used for WebSocket subscription
 */
export default async function getAllActiveClobTokenIds(): Promise<ClobTokenId[]> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const outcomes = await prismaClient.polymarket_outcome.findMany({
			where: {
				market: {
					active: true,
					closed: false
				}
			},
			select: {
				clob_token_id: true
			}
		})

		const clobTokenIds = outcomes.map((outcome) => outcome.clob_token_id as ClobTokenId)

		console.log(`📋 Retrieved ${clobTokenIds.length} active clob_token_ids from database`)

		return clobTokenIds
	} catch (error) {
		console.error("Error fetching active clob_token_ids:", error)
		throw error
	}
}
