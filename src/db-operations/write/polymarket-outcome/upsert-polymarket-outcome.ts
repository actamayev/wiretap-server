import PrismaClientClass from "../../../classes/prisma-client"

export default async function upsertPolymarketOutcome(outcome: ParsedOutcome, marketId: number): Promise<void> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		await prismaClient.polymarket_outcome.upsert({
			where: { clob_token_id: outcome.clobTokenId },
			update: {
				outcome: outcome.outcome,
				outcome_index: outcome.outcomeIndex,
			},
			create: {
				market_id: marketId,
				clob_token_id: outcome.clobTokenId,
				outcome: outcome.outcome,
				outcome_index: outcome.outcomeIndex,
			}
		})
	} catch (error) {
		console.error("Error upserting polymarket event:", error)
		throw error
	}
}
