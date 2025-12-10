import { Server as SocketIOServer } from "socket.io"
import Singleton from "./singleton"

export default class ClientWebSocketManager extends Singleton {
	private constructor(private readonly io: SocketIOServer) {
		super()
		console.log("✅ ClientWebSocketManager initialized")
	}

	public static override getInstance(io?: SocketIOServer): ClientWebSocketManager {
		if (!ClientWebSocketManager.instance) {
			if (!io) {
				throw new Error("SocketIOServer instance required to initialize ClientWebSocketManager")
			}
			ClientWebSocketManager.instance = new ClientWebSocketManager(io)
		}
		return ClientWebSocketManager.instance
	}

	/**
	 * Broadcast price updates to ALL connected clients
	 */
	public broadcastPriceUpdates(prices: PriceUpdate[]): void {
		const payload: MarketPricesUpdate = {
			prices,
			timestamp: Date.now()
		}

		this.io.emit("market:prices", payload)
		console.log(`📊 Broadcast ${prices.length} price updates to ${this.io.sockets.sockets.size} clients`)
	}

	/**
	 * Get connection statistics
	 */
	public getStats(): { totalConnections: number } {
		return {
			totalConnections: this.io.sockets.sockets.size
		}
	}
}
