import getAllPolymarketEvents from "./get-all-polymarket-events"
import PrismaClientClass from "../../classes/prisma-client"

// eslint-disable-next-line max-lines-per-function, complexity
export default async function initializePolymarketData(): Promise<void> {
	console.log("Fetching Polymarket events...")

	// 1. Fetch all active events with meaningful volume
	const events = await getAllPolymarketEvents({
		limit: 1000,
		active: true,
		closed: false,
	})

	console.log(`Fetched ${events.length} events`)

	// 2. Filter by volume threshold (e.g., $10k+ volume)
	const highVolumeEvents = events.filter(e => e.volume > 10000)

	console.log(`Filtered to ${highVolumeEvents.length} high-volume events`)

	const prismaClient = await PrismaClientClass.getPrismaClient()
	// 3. For each event, upsert event and markets
	for (const event of highVolumeEvents) {
		try {
			// ============================================
			// STEP 1: Upsert Event
			// ============================================
			await prismaClient.polymarket_event.upsert({
				where: { event_id: event.slug },
				update: {
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

			// ============================================
			// STEP 2: Upsert Markets (one per condition_id)
			// ============================================
			for (const market of event.markets) {
				// Parse the JSON strings from Polymarket API
				const outcomes: string[] = JSON.parse(market.outcomes)
				const outcomePrices: string[] = JSON.parse(market.outcomePrices)
				const clobTokenIds: string[] = JSON.parse(market.clobTokenIds)

				// Upsert the market itself (one row per condition_id)
				const upsertedMarket = await prismaClient.polymarket_market.upsert({
					where: { condition_id: market.conditionId },
					update: {
						question: market.question,
						active: market.active,
						closed: market.closed,
						accepting_orders: market.acceptingOrders ?? true,
						best_bid: market.bestBid,
						best_ask: market.bestAsk,
						last_trade_price: market.lastTradePrice,
						spread: market.spread,
						volume: market.volumeNum,
						liquidity: market.liquidityNum,
						volume_24hr: market.volume24hr,
						volume_1wk: market.volume1wk,
						volume_1mo: market.volume1mo,
						order_min_size: market.orderMinSize,
						order_min_tick_size: market.orderPriceMinTickSize,
						enable_order_book: market.enableOrderBook,
						restricted: market.restricted,
					},
					create: {
						condition_id: market.conditionId,
						event_id: event.slug,
						question: market.question,
						active: market.active,
						closed: market.closed,
						accepting_orders: market.acceptingOrders ?? true,
						best_bid: market.bestBid,
						best_ask: market.bestAsk,
						last_trade_price: market.lastTradePrice,
						spread: market.spread,
						volume: market.volumeNum,
						liquidity: market.liquidityNum,
						volume_24hr: market.volume24hr,
						volume_1wk: market.volume1wk,
						volume_1mo: market.volume1mo,
						order_min_size: market.orderMinSize,
						order_min_tick_size: market.orderPriceMinTickSize,
						enable_order_book: market.enableOrderBook,
						restricted: market.restricted,
					}
				})

				// ============================================
				// STEP 3: Upsert Outcomes (N per market)
				// ============================================
				// eslint-disable-next-line max-depth
				for (let i = 0; i < outcomes.length; i++) {
					const outcome = outcomes[i]
					const price = parseFloat(outcomePrices[i])
					const tokenId = clobTokenIds[i]

					await prismaClient.polymarket_outcome.upsert({
						where: { clob_token_id: tokenId },
						update: {
							outcome: outcome,
							outcome_index: i,
							current_price: price,
							// Price changes are typically at market level, not outcome level
							// but including them here if you want to track them per-outcome
						},
						create: {
							market_id: upsertedMarket.market_id,
							clob_token_id: tokenId,
							outcome: outcome,
							outcome_index: i,
							current_price: price,
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
