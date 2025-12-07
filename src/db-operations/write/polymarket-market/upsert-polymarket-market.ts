import PrismaClientClass from "../../../classes/prisma-client"
import { polymarket_market } from "../../../generated/prisma/client"

export default async function upsertPolymarketMarket(
	market: PolymarketMarket,
	eventId: EventId
): Promise<polymarket_market> {
	  try {
		  const prismaClient = await PrismaClientClass.getPrismaClient()

		  return await prismaClient.polymarket_market.upsert({
			  where: { condition_id: market.conditionId },
			  update: {
				  question: market.question,
				  active: market.active,
				  closed: market.closed,
				  accepting_orders: market.acceptingOrders ?? true,
				  last_trade_price: market.lastTradePrice,
				  volume: market.volumeNum,
				  volume_total: Number(market.volume),
			  },
			  create: {
				  condition_id: market.conditionId,
				  event_id: eventId,
				  question: market.question,
				  active: market.active,
				  closed: market.closed,
				  accepting_orders: market.acceptingOrders ?? true,
				  last_trade_price: market.lastTradePrice,
				  volume: market.volumeNum,
				  volume_total: Number(market.volume),
			  }
		  })
	  } catch (error) {
		  console.error("Error upserting polymarket market:", error)
		  throw error
	  }
}
