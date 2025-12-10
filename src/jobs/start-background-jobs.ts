import syncMarkets from "./sync-market"
import { SYNC_INTERVAL_MS } from "../utils/constants"
import { startPriceTracking } from "./start-price-tracking"

export default async function startBackgroundJobs(): Promise<void> {
	console.log("🚀 Starting background jobs...")

	// Run market sync immediately on startup
	await syncMarkets()

	await startPriceTracking()

	// Then run market sync every 5 minutes
	setInterval((): void => {
		try {
			void syncMarkets()
		} catch (error) {
			console.error("Error syncing markets:", error)
		}
	}, SYNC_INTERVAL_MS)
}
