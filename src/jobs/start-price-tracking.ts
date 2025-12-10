import PolymarketWebSocketClient from "../utils/polymarket/websocket-client"
import PriceTracker from "../classes/price-tracker"
import getAllActiveClobTokenIds from "../db-operations/read/polymarket-outcome/retrieve-all-active-clob-token-ids"

let wsClient: PolymarketWebSocketClient | null = null
let priceTracker: PriceTracker | null = null

/**
 * Start WebSocket connection and price tracking
 */
export async function startPriceTracking(): Promise<void> {
	try {
		console.log("🚀 Starting price tracking system...")

		// Get all active clob_token_ids from database
		const clobTokenIds = await getAllActiveClobTokenIds()

		if (clobTokenIds.length === 0) {
			console.warn("⚠️ No active markets found, skipping WebSocket connection")
			return
		}

		console.log(`📊 Found ${clobTokenIds.length} active clob_token_ids to track`)

		// Initialize price tracker
		priceTracker = PriceTracker.getInstance()

		// Initialize WebSocket client with callbacks
		wsClient = new PolymarketWebSocketClient({
			onPriceChange: (message): void => {
				priceTracker?.updateFromPriceChange(message)
			},
			onLastTradePrice: (message): void => {
				priceTracker?.updateFromLastTradePrice(message)
			},
			onError: (error): void => {
				console.error("WebSocket error:", error)
			},
			onClose: (): void => {
				console.log("WebSocket closed unexpectedly")
			}
		})

		// Connect to WebSocket
		await wsClient.connect(clobTokenIds)

		// Start minute timer for saving snapshots
		priceTracker.startMinuteTimer()

		console.log("✅ Price tracking system started successfully")
	} catch (error) {
		console.error("❌ Failed to start price tracking:", error)
		throw error
	}
}

/**
 * Stop WebSocket connection and price tracking
 */
export async function stopPriceTracking(): Promise<void> {
	console.log("🛑 Stopping price tracking system...")

	if (priceTracker) {
		priceTracker.stopMinuteTimer()
		priceTracker.clear()
		priceTracker = null
	}

	if (wsClient) {
		await wsClient.disconnect()
		wsClient = null
	}

	console.log("✅ Price tracking system stopped")
}

/**
 * Restart WebSocket connection with fresh market list
 * Called after market sync to pick up new markets
 */
export async function restartPriceTracking(): Promise<void> {
	console.log("🔄 Restarting price tracking with updated market list...")
	await stopPriceTracking()
	await startPriceTracking()
}

/**
 * Get current status (for health checks)
 */
export function getPriceTrackingStatus(): { connected: boolean; snapshotCount: number } {
	return {
		connected: wsClient?.isWebSocketConnected() ?? false,
		snapshotCount: priceTracker?.getSnapshotCount() ?? 0
	}
}
