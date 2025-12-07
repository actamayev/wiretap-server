/* eslint-disable max-depth */
import { fetchActiveEvents } from "../utils/polymarket/gamma-client"
import { filterBinaryEvents } from "../utils/polymarket/filter-markets"
import upsertPolymarketEvent from "../db-operations/write/polymarket-event/upsert-polymarket-event"
import upsertPolymarketMarket from "../db-operations/write/polymarket-market/upsert-polymarket-market"
import upsertPolymarketOutcome from "../db-operations/write/polymarket-outcome/upsert-polymarket-outcome"
import { parseMarketOutcomes } from "../utils/polymarket/parse-market-outcomes"

// eslint-disable-next-line complexity, max-lines-per-function
export default async function syncMarkets(): Promise<void> {
	console.log("\n🔄 Starting market sync...")

	try {
	  // 1. Fetch all active events
	  const events = await fetchActiveEvents()
	  console.log(`📊 Fetched ${events.length} active events (sorted by volume)`)

	  // 2. Filter for binary markets
	  const binaryEvents = filterBinaryEvents(events)
	  console.log(`🎯 Found ${binaryEvents.length} events with binary markets\n`)

	  // 3. Upsert to database
	  let eventCount = 0
	  let marketCount = 0
	  let outcomeCount = 0
	  let skipCount = 0

	  for (const event of binaryEvents) {
			try {
		  console.log(`\n📦 Processing event: ${event.title} (${event.id})`)
		  console.log(`   Volume: $${event.volume?.toLocaleString() || "N/A"}`)

		  // await upsertPolymarketEvent(event) // Uncomment when ready
		  eventCount++

		  for (const market of event.markets) {
					try {
			  console.log(`\n  📈 Processing market: ${market.question}`)

			  // Parse outcomes - this will throw if market is invalid
			  const parsedOutcomes = parseMarketOutcomes(market)

			  // await upsertPolymarketMarket(market, event.id) // Uncomment when ready
			  marketCount++

			  for (const outcome of parsedOutcomes) {
							// await upsertPolymarketOutcome(outcome, dbMarket.market_id) // Uncomment when ready
							outcomeCount++
			  }

			  console.log("  ✅ Market synced successfully")

					} catch (marketError) {
			  // eslint-disable-next-line max-len
			  console.error(`  ⚠️  Skipping market ${market.conditionId}: ${marketError instanceof Error ? marketError.message : "Unknown error"}`)
			  skipCount++
			  // Continue with next market
					}
		  }
			} catch (eventError) {
		  console.error(`❌ Failed to sync event ${event.id}:`, eventError)
		  skipCount++
		  // Continue with next event
			}
	  }

	  console.log("\n✅ Market sync complete:")
	  console.log(`   Events: ${eventCount}`)
	  console.log(`   Markets: ${marketCount}`)
	  console.log(`   Outcomes: ${outcomeCount}`)
	  console.log(`   Skipped: ${skipCount}`)

	} catch (error) {
	  console.error("\n❌ Market sync failed:", error)
	  // Don't throw - just log and continue
	}
}

