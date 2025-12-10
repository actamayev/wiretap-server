import WebSocket from "ws"
import { POLYMARKET_WS_URL, PING_INTERVAL_MS } from "../constants"

interface WebSocketClientCallbacks {
	onPriceChange: (message: PolymarketPriceChangeMessage) => void
	onLastTradePrice: (message: PolymarketLastTradePriceMessage) => void
	onError: (error: Error) => void
	onClose: () => void
}

export default class PolymarketWebSocketClient {
	private ws: WebSocket | null = null
	private pingInterval: NodeJS.Timeout | null = null
	private clobTokenIds: ClobTokenId[] = []
	private callbacks: WebSocketClientCallbacks
	private isConnected = false

	constructor(callbacks: WebSocketClientCallbacks) {
		this.callbacks = callbacks
	}

	/**
	 * Connect to Polymarket WebSocket and subscribe to markets
	 */
	public async connect(clobTokenIds: ClobTokenId[]): Promise<void> {
		if (this.isConnected) {
			console.warn("⚠️ WebSocket already connected, disconnecting first...")
			await this.disconnect()
		}

		this.clobTokenIds = clobTokenIds
		console.log(`🔌 Connecting to Polymarket WebSocket with ${clobTokenIds.length} assets...`)

		return new Promise((resolve, reject) => {
			this.ws = new WebSocket(POLYMARKET_WS_URL)

			this.ws.on("open", () => {
				console.log("✅ WebSocket connected")
				this.isConnected = true

				// Subscribe to market channel
				const subscription: MarketChannelSubscription = {
					type: "market",
					assets_ids: this.clobTokenIds
				}

				this.ws?.send(JSON.stringify(subscription))
				console.log(`📡 Subscribed to ${this.clobTokenIds.length} markets`)

				// Start ping interval
				this.startPingInterval()
				resolve()
			})

			this.ws.on("message", (data: WebSocket.RawData) => {
				this.handleMessage(data)
			})

			this.ws.on("error", (error) => {
				console.error("❌ WebSocket error:", error)
				this.callbacks.onError(error)
				reject(error)
			})

			this.ws.on("close", () => {
				console.log("🔌 WebSocket closed")
				this.isConnected = false
				this.stopPingInterval()
				this.callbacks.onClose()
			})
		})
	}

	/**
	 * Disconnect from WebSocket
	 */
	public disconnect(): Promise<void> {
		if (!this.ws) return Promise.resolve()

		console.log("🔌 Disconnecting WebSocket...")
		this.stopPingInterval()
		this.isConnected = false

		return new Promise((resolve) => {
			if (this.ws?.readyState === WebSocket.OPEN) {
				this.ws.close()
				this.ws.once("close", () => {
					this.ws = null
					resolve()
				})
			} else {
				this.ws = null
				resolve()
			}
		})
	}

	private handleMessage(data: WebSocket.RawData): void {
		const messageStr = data.toString()

		// Handle PONG responses (not JSON)
		if (messageStr === "PONG") return

		try {
			const parsed = JSON.parse(messageStr)

			// Handle array of messages (initial book snapshots)
			if (Array.isArray(parsed)) {
				for (const message of parsed) {
					this.processMessage(message)
				}
				return
			}

			// Handle single message
			this.processMessage(parsed)
		} catch (error) {
			console.error("Failed to parse WebSocket message:", error)
		}
	}

	/**
	 * Process a single WebSocket message
	 */
	private processMessage(message: PolymarketMarketChannelMessage): void {
		switch (message.event_type) {
		case "price_change":
			this.callbacks.onPriceChange(message)
			break

		case "last_trade_price":
			this.callbacks.onLastTradePrice(message)
			break

		case "book":
			// We don't process full order book snapshots
			break

		case "tick_size_change":
			// We don't track tick size changes
			break

		default:
			console.warn("Unknown WebSocket message type:", message)
		}
	}

	/**
	 * Start sending PING messages every 10 seconds
	 */
	private startPingInterval(): void {
		this.pingInterval = setInterval(() => {
			if (this.ws?.readyState === WebSocket.OPEN) {
				this.ws.send("PING")
			}
		}, PING_INTERVAL_MS)
	}

	/**
	 * Stop PING interval
	 */
	private stopPingInterval(): void {
		if (!this.pingInterval) return
		clearInterval(this.pingInterval)
		this.pingInterval = null
	}

	/**
	 * Check if WebSocket is connected
	 */
	public isWebSocketConnected(): boolean {
		return this.isConnected && this.ws?.readyState === WebSocket.OPEN
	}
}
