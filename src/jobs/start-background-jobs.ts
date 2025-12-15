import syncMarkets from "./sync-market"
import calculatePortfolioSnapshots from "./calculate-portfolio-snapshots"
import { SYNC_INTERVAL_MS, PORTFOLIO_SNAPSHOT_INTERVAL_MS } from "../utils/constants"
import EventsCache from "../classes/events-cache"

export default async function startBackgroundJobs(): Promise<void> {
	console.info("🚀 Starting background jobs...")

	// Run market sync immediately on startup
	await syncMarkets()

	// Start events cache refresh timer
	EventsCache.getInstance().startRefreshTimer()

	// Run portfolio snapshot calculation immediately on startup
	await calculatePortfolioSnapshots()

	// Then run market sync every 5 minutes
	setInterval((): void => {
		try {
			void syncMarkets()
		} catch (error) {
			console.error("Error syncing markets:", error)
		}
	}, SYNC_INTERVAL_MS)

	// Run portfolio snapshot calculation every minute
	setInterval((): void => {
		try {
			void calculatePortfolioSnapshots()
		} catch (error) {
			console.error("Error calculating portfolio snapshots:", error)
		}
	}, PORTFOLIO_SNAPSHOT_INTERVAL_MS)
}
