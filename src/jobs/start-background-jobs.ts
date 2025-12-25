import syncMarkets from "./sync-market"
import syncMarketResolution from "./sync-market-resolution"
import calculatePortfolioSnapshots from "./calculate-portfolio-snapshots"
import cleanupOldSnapshots from "./cleanup-old-snapshots"
import {
	SYNC_INTERVAL_MS,
	PORTFOLIO_SNAPSHOT_INTERVAL_MS,
	CLEANUP_INTERVAL_MS,
	RESOLUTION_CHECK_INTERVAL_MS
} from "../utils/constants"
import EventsCache from "../classes/events-cache"

export default async function startBackgroundJobs(): Promise<void> {
	console.info("🚀 Starting background jobs...")

	// Run market sync immediately on startup
	await syncMarkets()

	// // Start events cache refresh timer
	EventsCache.getInstance().startRefreshTimer()

	// Run resolution sync immediately on startup
	await syncMarketResolution()

	// Run portfolio snapshot calculation immediately on startup
	await calculatePortfolioSnapshots()

	// Run cleanup immediately on startup
	await cleanupOldSnapshots()

	// // Then run market sync every 5 minutes
	setInterval((): void => {
		try {
			void syncMarkets()
		} catch (error) {
			console.error("Error syncing markets:", error)
		}
	}, SYNC_INTERVAL_MS)

	// Run resolution sync every 5 minutes (offset by 2.5 minutes to spread load)
	setTimeout(() => {
		setInterval((): void => {
			try {
				void syncMarketResolution()
			} catch (error) {
				console.error("Error syncing market resolutions:", error)
			}
		}, RESOLUTION_CHECK_INTERVAL_MS)
	}, RESOLUTION_CHECK_INTERVAL_MS / 2)

	// Run portfolio snapshot calculation every minute
	setInterval((): void => {
		try {
			void calculatePortfolioSnapshots()
		} catch (error) {
			console.error("Error calculating portfolio snapshots:", error)
		}
	}, PORTFOLIO_SNAPSHOT_INTERVAL_MS)

	// // Run cleanup every hour
	setInterval((): void => {
		try {
			void cleanupOldSnapshots()
		} catch (error) {
			console.error("Error cleaning up snapshots:", error)
		}
	}, CLEANUP_INTERVAL_MS)
}
