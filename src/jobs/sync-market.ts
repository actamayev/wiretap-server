import { fetchActiveEvents } from "../utils/polymarket/gamma-client"
import { filterBinaryEvents } from "../utils/polymarket/filter-markets"
import upsertPolymarketEvent from "../db-operations/write/polymarket-event/upsert-polymarket-event"
import upsertPolymarketMarket from "../db-operations/write/polymarket-market/upsert-polymarket-market"
import upsertPolymarketOutcome from "../db-operations/write/polymarket-outcome/upsert-polymarket-outcome"
import { parseMarketOutcomes } from "../utils/polymarket/parse-market-outcomes"

export default async function syncMarkets(): Promise<void> {
	console.log("🔄 Starting market sync...")

	try {
		// 1. Fetch all events from Gamma API
		const events = await fetchActiveEvents()
		console.log(`Events: ${JSON.stringify(events, null, 2)}`)
		// 2. Filter for binary markets with sufficient volume
		const binaryEvents = filterBinaryEvents(events)

		console.log(`Found ${binaryEvents.length} binary events to sync`)

		// 3. Upsert to database
		for (const event of binaryEvents) {
			console.log(`Upserting event ${JSON.stringify(event, null, 2)}`)
			// await upsertPolymarketEvent(event)

			for (const market of event.markets) {
				console.log(`Upserting market ${JSON.stringify(market, null, 2)}`)
				// const dbMarket = await upsertPolymarketMarket(market, event.id)

				// Parse outcomes from JSON strings
				const parsedOutcomes = parseMarketOutcomes(market)

				// eslint-disable-next-line max-depth
				for (const outcome of parsedOutcomes) {
					console.log(`Upserting outcome ${JSON.stringify(outcome, null, 2)}`)
				//   await upsertPolymarketOutcome(outcome, dbMarket.market_id)
				}
			  }
		}

		console.log("✅ Market sync complete")
	} catch (error) {
		console.error("❌ Market sync failed:", error)
		throw error
	}
}
