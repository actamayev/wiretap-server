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
	public broadcastPriceUpdates(snapshots: PriceSnapshot[]): void {
		const payload: MarketPricesUpdate = {
			prices: snapshots.map(snapshot => ({
				clobTokenId: snapshot.clobTokenId,
				bestBid: snapshot.bestBid,
				bestAsk: snapshot.bestAsk,
				lastTradePrice: snapshot.lastTradePrice
			})),
			timestamp: Date.now()
		}

		this.io.emit("market:prices", payload)
		console.log(`📊 Broadcast ${snapshots.length} price updates to ${this.io.sockets.sockets.size} clients`)
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
