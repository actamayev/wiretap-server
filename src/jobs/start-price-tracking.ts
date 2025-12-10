import PolymarketWebSocketClient from "../utils/polymarket/websocket-client"
import PriceTracker from "../classes/price-tracker"
import getAllActiveClobTokenIds from "../db-operations/read/polymarket-outcome/retrieve-all-active-clob-token-ids"

let wsClient: PolymarketWebSocketClient | null = null

export async function startPriceTracking(): Promise<void> {
	try {
		console.log("🚀 Starting price tracking system...")

		const clobTokenIds = await getAllActiveClobTokenIds()

		if (clobTokenIds.length === 0) {
			console.warn("⚠️ No active markets found, skipping WebSocket connection")
			return
		}

		console.log(`📊 Found ${clobTokenIds.length} active clob_token_ids to track`)

		// Get singleton instance directly
		const priceTracker = PriceTracker.getInstance()

		wsClient = new PolymarketWebSocketClient({
			onPriceChange: (message): void => {
				PriceTracker.getInstance().updateFromPriceChange(message)
			},
			onLastTradePrice: (message): void => {
				PriceTracker.getInstance().updateFromLastTradePrice(message)
			},
			onError: (error): void => {
				console.error("WebSocket error:", error)
			},
			onClose: (): void => {
				console.log("WebSocket closed unexpectedly")
			}
		})

		await wsClient.connect(clobTokenIds)
		priceTracker.startMinuteTimer()

		console.log("✅ Price tracking system started successfully")
	} catch (error) {
		console.error("❌ Failed to start price tracking:", error)
		throw error
	}
}

export async function stopPriceTracking(): Promise<void> {
	console.log("🛑 Stopping price tracking system...")

	// Singleton persists, just stop its timer and clear data
	const priceTracker = PriceTracker.getInstance()
	priceTracker.stopMinuteTimer()
	priceTracker.clear()

	if (wsClient) {
		await wsClient.disconnect()
		wsClient = null
	}

	console.log("✅ Price tracking system stopped")
}

export async function restartPriceTracking(): Promise<void> {
	console.log("🔄 Restarting price tracking with updated market list...")
	await stopPriceTracking()
	await startPriceTracking()
}

export function getPriceTrackingStatus(): { connected: boolean; snapshotCount: number } {
	return {
		connected: wsClient?.isWebSocketConnected() ?? false,
		snapshotCount: PriceTracker.getInstance().getSnapshotCount()
	}
}
