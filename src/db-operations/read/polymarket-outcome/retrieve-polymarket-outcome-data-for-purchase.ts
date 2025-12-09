import PrismaClientClass from "../../../classes/prisma-client"

interface PolymarketOutcomeDataForPurchase {
	outcome: OutcomeString
	marketQuestion: string | null
	polymarketSlug: EventSlug
	polymarketImageUrl: string
}

export default async function retrievePolymarketOutcomeDataForPurchase(clobToken: ClobTokenId): Promise<PolymarketOutcomeDataForPurchase> {
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
		} satisfies PolymarketOutcomeDataForPurchase
	} catch (error) {
		console.error("Error finding user by Id:", error)
		throw error
	}
}
