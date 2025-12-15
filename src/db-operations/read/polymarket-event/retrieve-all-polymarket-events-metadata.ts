import PrismaClientClass from "../../../classes/prisma-client"

// eslint-disable-next-line max-lines-per-function
export default async function retrieveAllPolymarketEventsMetadata(): Promise<SingleEventMetadata[]> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const rawPolymarketEvents = await prismaClient.polymarket_event.findMany({
			where: {
				active: true,
				closed: false,
				archived: false,
			},
			select: {
				event_id: true,
				event_slug: true,
				title: true,
				description: true,
				image_url: true,
				icon_url: true,
				polymarket_url: true,
				created_at: true,
				updated_at: true,
				markets: {
					where: {
						active: true,
						closed: false,
					},
					select: {
						market_id: true,
						question: true,
						midpoint_price: true,
						created_at: true,
						updated_at: true,
						outcomes: {
							select: {
								outcome: true,
								clob_token_id: true,
							},
						},
					}
				},
				total_volume: true,
				end_date: true,
			}
		})

		return rawPolymarketEvents.map((event) => ({
			eventId: event.event_id as EventId,
			eventSlug: event.event_slug as EventSlug,
			eventTitle: event.title,
			eventDescription: event.description,
			eventImageUrl: event.image_url as string,
			eventIconUrl: event.icon_url as string,
			eventPolymarketUrl: event.polymarket_url as string,
			eventCreatedAt: event.created_at,
			eventUpdatedAt: event.updated_at,
			eventMarkets: event.markets.map((market) => ({
				marketId: market.market_id as MarketId,
				marketQuestion: market.question,
				marketCreatedAt: market.created_at,
				marketUpdatedAt: market.updated_at,
				midpointPrice: market.midpoint_price,
				outcomes: market.outcomes.sort((a) => a.outcome === "YES" ? -1 : 1).map((outcome) => ({
					outcome: outcome.outcome as OutcomeString,
					clobTokenId: outcome.clob_token_id as ClobTokenId,
				})),
			})),
			eventTotalVolume: event.total_volume as number,
			eventEndDate: event.end_date as Date,
		}) satisfies SingleEventMetadata)
	} catch (error) {
		console.error(error)
		throw error
	}
}
