import PrismaClientClass from "../../../classes/prisma-client"

export default async function retrievePolymarketOutcomeDataForTrade(clobToken: ClobTokenId): Promise<PolymarketOutcomeDataForTrade> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const outcome = await prismaClient.polymarket_outcome.findUniqueOrThrow({
			where: { clob_token_id: clobToken },
			select: {
				outcome: true,
				market: {
					select: {
						question: true,
						event: {
							select: {
								event_slug: true,
								image_url: true
							}
						}
					}
				}
			}
		})

		return {
			outcome: outcome.outcome as OutcomeString,
			marketQuestion: outcome.market.question,
			polymarketSlug: outcome.market.event.event_slug as EventSlug,
			polymarketImageUrl: outcome.market.event.image_url as string
		} satisfies PolymarketOutcomeDataForTrade
	} catch (error) {
		console.error("Error finding user by Id:", error)
		throw error
	}
}
