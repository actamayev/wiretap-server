/* eslint-disable max-depth */
import fetchActiveEvents from "../utils/polymarket/gamma-client"
import upsertPolymarketEvent from "../db-operations/write/polymarket-event/upsert-polymarket-event"
import upsertPolymarketMarket from "../db-operations/write/polymarket-market/upsert-polymarket-market"
import upsertPolymarketOutcome from "../db-operations/write/polymarket-outcome/upsert-polymarket-outcome"
import parseMarketOutcomes from "../utils/polymarket/parse-market-outcomes"

// eslint-disable-next-line complexity
export default async function syncMarkets(): Promise<void> {
	console.info("🔄 Starting market sync...")

	try {
		const events = await fetchActiveEvents()

		let eventCount = 0
		let marketCount = 0
		let outcomeCount = 0
		let skipCount = 0

		for (const event of events) {
			try {
				await upsertPolymarketEvent(event)
				eventCount++

				for (const market of event.markets) {
					// Skip markets without a conditionId
					if (!market.conditionId || market.conditionId.trim() === "") {
						skipCount++
						continue
					}

					try {
						const dbMarket = await upsertPolymarketMarket(market, event.id)
						marketCount++
						const parsedOutcomes = parseMarketOutcomes(market)

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
	} catch (error) {
		console.error("❌ Market sync failed:", error)
	}
}
