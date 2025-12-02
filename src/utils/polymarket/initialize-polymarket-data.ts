import getAllPolymarketEvents from "./get-all-polymarket-events"
import PrismaClientClass from "../../classes/prisma-client"

// eslint-disable-next-line max-lines-per-function, complexity
export default async function initializePolymarketData(): Promise<void> {
	console.log("Fetching Polymarket events...")

	// 1. Fetch all active events with meaningful volume
	const events = await getAllPolymarketEvents({
		limit: 1000,
		active: true,
		closed: false
	})

	console.log(`Fetched ${events.length} events`)

	// 2. Filter by volume threshold (e.g., $10k+ volume)
	const highVolumeEvents = events.filter(e => e.volume > 10000)

	console.log(`Filtered to ${highVolumeEvents.length} high-volume events`)

	const prismaClient = await PrismaClientClass.getPrismaClient()

	// 3. For each event, upsert event and markets
	for (const event of highVolumeEvents) {
		try {
			// Upsert event
			await prismaClient.polymarket_event.upsert({
				where: { event_id: event.slug },
				update: {
					title: event.title,
					description: event.description,
					active: event.active,
					closed: event.closed,
					archived: event.archived,
					resolved: event.closed, // Will need separate check for actual resolution
					liquidity: event.liquidity,
					volume: event.volume,
					volume_24hr: event.volume24hr,
					volume_1wk: event.volume1wk,
					volume_1mo: event.volume1mo,
					start_date: event.startDate ? new Date(event.startDate) : null,
					end_date: event.endDate ? new Date(event.endDate) : null,
					polymarket_url: `https://polymarket.com/event/${event.slug}`,
					image_url: event.image,
					icon_url: event.icon,
					enable_order_book: event.enableOrderBook,
					restricted: event.restricted,
					category: event.category,
				},
				create: {
					event_id: event.slug,
					title: event.title,
					description: event.description,
					active: event.active,
					closed: event.closed,
					archived: event.archived,
					resolved: event.closed,
					liquidity: event.liquidity,
					volume: event.volume,
					volume_24hr: event.volume24hr,
					volume_1wk: event.volume1wk,
					volume_1mo: event.volume1mo,
					start_date: event.startDate ? new Date(event.startDate) : null,
					end_date: event.endDate ? new Date(event.endDate) : null,
					polymarket_url: `https://polymarket.com/event/${event.slug}`,
					image_url: event.image,
					icon_url: event.icon,
					enable_order_book: event.enableOrderBook,
					restricted: event.restricted,
					category: event.category,
				}
			})

			// Upsert markets for this event
			for (const market of event.markets) {
				// Parse the JSON strings from Polymarket API
				const outcomes: string[] = JSON.parse(market.outcomes)
				const outcomePrices: string[] = JSON.parse(market.outcomePrices)
				const clobTokenIds: string[] = JSON.parse(market.clobTokenIds)

				// Create a row for each outcome (YES/NO for binary, or each candidate for multi-outcome)
				// eslint-disable-next-line max-depth
				for (let i = 0; i < outcomes.length; i++) {
					const outcome = outcomes[i]
					const price = parseFloat(outcomePrices[i])
					const tokenId = clobTokenIds[i]

					await prismaClient.polymarket_market.upsert({
						where: { clob_token_id: tokenId },
						update: {
							current_price: price,
							best_bid: market.bestBid,
							best_ask: market.bestAsk,
							last_trade_price: market.lastTradePrice,
							spread: market.spread,
							price_change_24hr: market.oneDayPriceChange,
							price_change_1wk: market.oneWeekPriceChange,
							price_change_1mo: market.oneMonthPriceChange,
							active: market.active,
							accepting_orders: market.acceptingOrders ?? true,
						},
						create: {
							condition_id: market.conditionId,
							clob_token_id: tokenId,
							event_id: event.slug,
							outcome: outcome,
							outcome_index: i,
							current_price: price,
							best_bid: market.bestBid,
							best_ask: market.bestAsk,
							last_trade_price: market.lastTradePrice,
							spread: market.spread,
							price_change_24hr: market.oneDayPriceChange,
							price_change_1wk: market.oneWeekPriceChange,
							price_change_1mo: market.oneMonthPriceChange,
							active: market.active,
							accepting_orders: market.acceptingOrders ?? true,
						}
					})
				}
			}

			console.log(`✓ Upserted event: ${event.title}`)
		} catch (error) {
			console.error(`✗ Failed to upsert event ${event.slug}:`, error)
		}
	}

	console.log("Polymarket data initialization complete")
}
