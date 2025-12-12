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
			onPriceChange: (message: PolymarketPriceChangeMessage): void => {
				PriceTracker.getInstance().updateFromPriceChange(message)
			},
			onLastTradePrice: (message: PolymarketLastTradePriceMessage): void => {
				PriceTracker.getInstance().updateFromLastTradePrice(message)
			},
			onError: (error): void => {
				console.error("WebSocket error:", error)
			},
			onClose: (): void => {
				console.error("🔌 WebSocket closed unexpectedly - attempting reconnect...")
				// Attempt to reconnect after 5 seconds
				setTimeout(() => {
					void restartPriceTracking()
				}, 5000)
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

/**
 * Update WebSocket subscription with new market list
 * Only updates if the list has actually changed
 */
export async function updatePriceTracking(): Promise<void> {
	try {
		if (!wsClient || !wsClient.isWebSocketConnected()) {
			console.warn("⚠️ WebSocket not connected, cannot update subscription")
			return
		}

		// Get fresh list of active clob_token_ids
		const newClobTokenIds = await getAllActiveClobTokenIds()

		if (newClobTokenIds.length === 0) {
			console.warn("⚠️ No active markets found")
			return
		}

		// Get current subscription list from WebSocket client
		// We need to add a getter for this
		const currentTokenIds = wsClient.getCurrentSubscription()

		// Compare lists (order doesn't matter)
		const currentSet = new Set(currentTokenIds)
		const newSet = new Set(newClobTokenIds)

		const hasChanged =
			currentSet.size !== newSet.size ||
			![...currentSet].every(token => newSet.has(token))

		if (!hasChanged) {
			console.log("✅ Market list unchanged, skipping subscription update")
			return
		}

		console.log(`🔄 Market list changed: ${currentTokenIds.length} → ${newClobTokenIds.length} tokens`)

		// Update subscription without disconnecting
		wsClient.updateSubscription(newClobTokenIds)

		console.log("✅ Price tracking subscription updated")
	} catch (error) {
		console.error("❌ Failed to update price tracking:", error)
		// Don't throw - let existing connection continue
	}
}

async function stopPriceTracking(): Promise<void> {
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

async function restartPriceTracking(): Promise<void> {
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
