/* eslint-disable max-depth */
import fetchActiveEvents from "../utils/polymarket/gamma-client"
import filterBinaryEvents from "../utils/polymarket/filter-markets"
import upsertPolymarketEvent from "../db-operations/write/polymarket-event/upsert-polymarket-event"
import upsertPolymarketMarket from "../db-operations/write/polymarket-market/upsert-polymarket-market"
import upsertPolymarketOutcome from "../db-operations/write/polymarket-outcome/upsert-polymarket-outcome"
import parseMarketOutcomes from "../utils/polymarket/parse-market-outcomes"
import { getPriceTrackingStatus, updatePriceTracking } from "./start-price-tracking"

// eslint-disable-next-line max-lines-per-function
export default async function syncMarkets(): Promise<void> {
	console.info("🔄 Starting market sync...")

	try {
		const events = await fetchActiveEvents()
		const binaryEvents = filterBinaryEvents(events)

		let eventCount = 0
		let marketCount = 0
		let outcomeCount = 0
		let skipCount = 0

		for (const event of binaryEvents) {
			try {
				await upsertPolymarketEvent(event)
				eventCount++

				for (const market of event.markets) {
					try {
						const parsedOutcomes = parseMarketOutcomes(market)
						const dbMarket = await upsertPolymarketMarket(market, event.id)
						marketCount++

						for (const outcome of parsedOutcomes) {
							await upsertPolymarketOutcome(outcome, dbMarket.market_id)
							outcomeCount++
						}

					} catch (marketError) {
						// eslint-disable-next-line max-len
						console.error(`Skipping market ${market.conditionId}:`, marketError instanceof Error ? marketError.message : marketError)
						skipCount++
					}
				}
			} catch (eventError) {
				console.error(`Failed to sync event ${event.id}:`, eventError)
				skipCount++
			}
		}

		console.info(`✅ Market sync complete: ${eventCount} events, ${marketCount} markets, ${outcomeCount} outcomes, ${skipCount} skipped`)

		// Restart WebSocket with updated market list
		console.info("🔄 Updating WebSocket subscription with new markets...")
		const status = getPriceTrackingStatus()
		if (status.connected) {
			await updatePriceTracking()
		} else {
			console.info("⏭️  WebSocket not yet started, skipping subscription update")
		}
	} catch (error) {
		console.error("❌ Market sync failed:", error)
	}
}
