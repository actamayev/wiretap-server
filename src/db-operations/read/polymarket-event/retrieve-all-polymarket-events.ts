import PrismaClientClass from "../../../classes/prisma-client"

// eslint-disable-next-line max-lines-per-function
export default async function retrieveAllPolymarketEvents(): Promise<SingleEvent[]> {
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
								price_history: {
									select: {
										best_bid: true,
										best_ask: true,
										last_trade_price: true,
										timestamp: true,
									},
								},
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
				bestBid: market.best_bid,
				bestAsk: market.best_ask,
				lastTradePrice: market.last_trade_price,
				spread: market.spread,
				outcomes: market.outcomes.sort((a) => a.outcome === "YES" ? -1 : 1).map((outcome) => ({
					outcome: outcome.outcome as OutcomeString,
					clobTokenId: outcome.clob_token_id as ClobTokenId,
					priceHistory: outcome.price_history.map((price) => ({
						timestamp: price.timestamp,
						price: price.best_ask || 0,
					})),
				})),
			})),
			eventTotalVolume: event.total_volume as number,
			eventEndDate: event.end_date as Date,
		}))
	} catch (error) {
		console.error(error)
		throw error
	}
}
