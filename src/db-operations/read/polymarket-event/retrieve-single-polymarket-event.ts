import isNull from "lodash/isNull"
import PrismaClientClass from "../../../classes/prisma-client"

// eslint-disable-next-line max-lines-per-function
export default async function retrieveSinglePolymarketEvent(eventId: EventId): Promise<SingleEvent | null> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const rawPolymarketEvent = await prismaClient.polymarket_event.findUnique({
			where: { event_id: eventId },
			select: {
				event_id: true,
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
						created_at: true,
						updated_at: true,
					}
				}
			}
		})

		if (isNull(rawPolymarketEvent)) return null

		return {
			eventId: rawPolymarketEvent.event_id as EventId,
			eventTitle: rawPolymarketEvent.title,
			eventDescription: rawPolymarketEvent.description,
			eventImageUrl: rawPolymarketEvent.image_url as string,
			eventIconUrl: rawPolymarketEvent.icon_url as string,
			eventPolymarketUrl: rawPolymarketEvent.polymarket_url as string,
			eventCreatedAt: rawPolymarketEvent.created_at,
			eventUpdatedAt: rawPolymarketEvent.updated_at,
			eventMarkets: rawPolymarketEvent.markets.map((market) => ({
				marketId: market.market_id as MarketId,
				marketQuestion: market.question,
				marketCreatedAt: market.created_at,
				marketUpdatedAt: market.updated_at,
			})),
		}
	} catch (error) {
		console.error(error)
		throw error
	}
}
