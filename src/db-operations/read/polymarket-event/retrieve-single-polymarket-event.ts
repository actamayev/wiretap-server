import PrismaClientClass from "../../../classes/prisma-client"

// eslint-disable-next-line max-lines-per-function
export default async function retrieveSinglePolymarketEvent(eventId: EventId): Promise<SingleEvent> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const rawPolymarketEvent = await prismaClient.polymarket_event.findUniqueOrThrow({
			where: { event_id: eventId },
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
						best_bid: true,
						best_ask: true,
						last_trade_price: true,
						spread: true,
						created_at: true,
						updated_at: true,
						outcomes: {
							select: {
								outcome: true,
								clob_token_id: true,
							},
						},
					},
				},
				total_volume: true,
				end_date: true,
			}
		})

		return {
			eventId: rawPolymarketEvent.event_id as EventId,
			eventSlug: rawPolymarketEvent.event_slug as EventSlug,
			eventTitle: rawPolymarketEvent.title,
			eventDescription: rawPolymarketEvent.description,
			eventImageUrl: rawPolymarketEvent.image_url as string,
			eventIconUrl: rawPolymarketEvent.icon_url as string,
			eventPolymarketUrl: rawPolymarketEvent.polymarket_url as string,
			eventCreatedAt: rawPolymarketEvent.created_at,
			eventUpdatedAt: rawPolymarketEvent.updated_at,
			eventTotalVolume: rawPolymarketEvent.total_volume as number,
			eventMarkets: rawPolymarketEvent.markets.map((market) => ({
				marketId: market.market_id as MarketId,
				marketQuestion: market.question,
				marketCreatedAt: market.created_at,
				marketUpdatedAt: market.updated_at,
				bestBid: market.best_bid,
				bestAsk: market.best_ask,
				lastTradePrice: market.last_trade_price,
				spread: market.spread,
				outcomes: market.outcomes.sort((a) => a.outcome === "YES" ? -1 : 1).map((outcome) => ({
					outcome: outcome.outcome as OutcomeString,
					clobTokenId: outcome.clob_token_id as ClobTokenId,
				})),
			})),
			eventEndDate: rawPolymarketEvent.end_date as Date,
		}
	} catch (error) {
		console.error(error)
		throw error
	}
}
