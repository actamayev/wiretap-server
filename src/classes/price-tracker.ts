import createPriceSnapshots from "../db-operations/write/polymarket-price-history/create-price-snapshots"
import Singleton from "./singleton"
import calculatePortfolioSnapshots from "../jobs/calculate-portfolio-snapshots"
import { isNull, isUndefined } from "lodash"
import ClientWebSocketManager from "./client-websocket-manager"

/**
 * Manages in-memory price snapshots and periodic saving to database
 */
export default class PriceTracker extends Singleton {
	private priceSnapshots: Map<ClobTokenId, PriceSnapshot> = new Map()
	private saveTimer: NodeJS.Timeout | null = null
	private readonly SNAPSHOT_INTERVAL_MS = 60000

	private constructor() {
		super()
	}

	public static override getInstance(): PriceTracker {
		if (PriceTracker.instance === null) {
			PriceTracker.instance = new PriceTracker()
		}
		return PriceTracker.instance
	}

	/**
	 * Update price data from a price_change message
	 */
	public updateFromPriceChange(message: PolymarketPriceChangeMessage): void {
		for (const change of message.price_changes) {
			const existing = this.priceSnapshots.get(change.asset_id)

			this.priceSnapshots.set(change.asset_id, {
				clobTokenId: change.asset_id,
				bestBid: parseFloat(change.best_bid),
				bestAsk: parseFloat(change.best_ask),
				lastTradePrice: existing?.lastTradePrice ?? null,
				timestamp: Date.now()
			})
		}
	}

	/**
	 * Update last trade price from a last_trade_price message
	 */
	public updateFromLastTradePrice(message: PolymarketLastTradePriceMessage): void {
		const existing = this.priceSnapshots.get(message.asset_id)

		this.priceSnapshots.set(message.asset_id, {
			clobTokenId: message.asset_id,
			bestBid: existing?.bestBid ?? null,
			bestAsk: existing?.bestAsk ?? null,
			lastTradePrice: parseFloat(message.price),
			timestamp: Date.now()
		})
	}

	/**
	 * Calculate midpoint from a price snapshot
	 */
	public getMidpoint(clobTokenId: ClobTokenId): number | null {
		const snapshot = this.priceSnapshots.get(clobTokenId)
		if (
			isUndefined(snapshot) ||
			isNull(snapshot.bestBid) ||
			isNull(snapshot.bestAsk)
		) return null
		return (snapshot.bestBid + snapshot.bestAsk) / 2
	}

	public getBestAsk(clobTokenId: ClobTokenId): number | null {
		const snapshot = this.priceSnapshots.get(clobTokenId)
		if (
			isUndefined(snapshot) ||
			isNull(snapshot.bestAsk)
		) return null
		return snapshot.bestAsk
	}

	public getBestBid(clobTokenId: ClobTokenId): number | null {
		const snapshot = this.priceSnapshots.get(clobTokenId)
		if (
			isUndefined(snapshot) ||
			isNull(snapshot.bestBid)
		) return null
		return snapshot.bestBid
	}
	/**
	 * Start the interval timer for saving snapshots
	 */
	public startMinuteTimer(): void {
		console.log(`⏰ Starting price snapshot timer (interval: ${this.SNAPSHOT_INTERVAL_MS / 1000}s)`)
		this.scheduleNextMinute()
	}

	/**
	 * Stop the interval timer
	 */
	public stopMinuteTimer(): void {
		if (!this.saveTimer) return
		clearTimeout(this.saveTimer)
		this.saveTimer = null
		console.log("⏰ Stopped price snapshot timer")
	}

	/**
	 * Schedule the next save at the exact interval boundary
	 */
	private scheduleNextMinute(): void {
		const now = Date.now()
		const nextInterval = Math.ceil(now / this.SNAPSHOT_INTERVAL_MS) * this.SNAPSHOT_INTERVAL_MS
		const delay = nextInterval - now

		this.saveTimer = setTimeout(() => {
			this.savePriceSnapshots()
				.then(() => this.scheduleNextMinute())
				.catch(error => console.error("Error in price snapshot timer:", error))
		}, delay)

		const nextTime = new Date(nextInterval).toISOString()
		console.log(`⏰ Next price snapshot save scheduled for ${nextTime} (in ${Math.round(delay / 1000)}s)`)
	}

	/**
	 * Save all current snapshots to database and calculate portfolio snapshots
	 * NOTE: We don't clear the Map - it acts as a permanent cache
	 */
	private async savePriceSnapshots(): Promise<void> {
		if (this.priceSnapshots.size === 0) return

		try {
			const snapshots = Array.from(this.priceSnapshots.values())
			console.log(`💾 Saving ${snapshots.length} price snapshots to database...`)

			await createPriceSnapshots(snapshots)
			console.log(`✅ Saved ${snapshots.length} price snapshots`)

			ClientWebSocketManager.getInstance().broadcastPriceUpdates(snapshots)

			// Calculate portfolio snapshots immediately after saving prices
			await calculatePortfolioSnapshots()

			// DON'T clear the Map - keep prices in memory for fast lookups
		} catch (error) {
			console.error("❌ Failed to save price snapshots:", error)
		}
	}

	/**
	 * Get current snapshot count (for monitoring)
	 */
	public getSnapshotCount(): number {
		return this.priceSnapshots.size
	}

	/**
	 * Clear all snapshots (used when reconnecting)
	 */
	clear(): void {
		this.priceSnapshots.clear()
	}
}
