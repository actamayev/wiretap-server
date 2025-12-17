import PrismaClientClass from "../../../classes/prisma-client"
import { polymarket_market } from "../../../generated/prisma/client"

// eslint-disable-next-line max-lines-per-function
export default async function upsertPolymarketMarket(
	market: PolymarketMarket,
	eventId: EventId
): Promise<polymarket_market> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		let midpointPrice: number | null = null
		if (market.bestBid !== undefined && market.bestAsk !== undefined) {
			midpointPrice = (market.bestBid + market.bestAsk) / 2
		}

		return await prismaClient.polymarket_market.upsert({
			where: { condition_id: market.conditionId },
			update: {
				question: market.question,
				active: market.active,
				closed: market.closed,
				accepting_orders: market.acceptingOrders ?? true,
				volume: market.volumeNum,
				volume_total: Number(market.volume),
				best_bid: market.bestBid,
				best_ask: market.bestAsk,
				midpoint_price: midpointPrice,
				last_trade_price: market.lastTradePrice,
				spread: market.spread,
			},
			create: {
				condition_id: market.conditionId,
				event_id: eventId,
				question: market.question,
				active: market.active,
				closed: market.closed,
				accepting_orders: market.acceptingOrders ?? true,
				volume: market.volumeNum,
				volume_total: Number(market.volume),
				best_bid: market.bestBid,
				best_ask: market.bestAsk,
				midpoint_price: midpointPrice,
				last_trade_price: market.lastTradePrice,
				spread: market.spread,
			}
		})
	} catch (error) {
		console.error("Error upserting polymarket market:", error)
		throw error
	}
}
