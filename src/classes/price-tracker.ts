import createPriceSnapshots from "../db-operations/write/polymarket-price-history/create-price-snapshots"
import Singleton from "./singleton"
import { calculatePortfolioSnapshots } from "../jobs/calculate-portfolio-snapshots"

/**
 * Manages in-memory price snapshots and periodic saving to database
 */
export default class PriceTracker extends Singleton {
	private priceSnapshots: Map<ClobTokenId, PriceSnapshot> = new Map()
	private saveTimer: NodeJS.Timeout | null = null

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
	 * Get price snapshot from in-memory cache
	 */
	public getPriceSnapshot(clobTokenId: ClobTokenId): PriceSnapshot | null {
		return this.priceSnapshots.get(clobTokenId) ?? null
	}

	/**
	 * Calculate midpoint from a price snapshot
	 */
	public getMidpoint(clobTokenId: ClobTokenId): number | null {
		const snapshot = this.priceSnapshots.get(clobTokenId)
		if (!snapshot || snapshot.bestBid === null || snapshot.bestAsk === null) {
			return null
		}
		return (snapshot.bestBid + snapshot.bestAsk) / 2
	}

	/**
	 * Start the minute-interval timer for saving snapshots
	 */
	public startMinuteTimer(): void {
		console.log("⏰ Starting minute-interval price snapshot timer")
		this.scheduleNextMinute()
	}

	/**
	 * Stop the minute timer
	 */
	public stopMinuteTimer(): void {
		if (this.saveTimer) {
			clearTimeout(this.saveTimer)
			this.saveTimer = null
			console.log("⏰ Stopped minute-interval timer")
		}
	}

	/**
	 * Schedule the next save at the exact minute boundary
	 */
	private scheduleNextMinute(): void {
		const now = Date.now()
		const nextMinute = Math.ceil(now / 60000) * 60000
		const delay = nextMinute - now

		this.saveTimer = setTimeout(() => {
			this.savePriceSnapshots()
				.then(() => this.scheduleNextMinute())
				.catch(error => console.error("Error in minute timer:", error))
		}, delay)

		const nextTime = new Date(nextMinute).toISOString()
		console.log(`⏰ Next price snapshot save scheduled for ${nextTime} (in ${Math.round(delay / 1000)}s)`)
	}

	/**
	 * Save all current snapshots to database and calculate portfolio snapshots
	 * NOTE: We don't clear the Map - it acts as a permanent cache
	 */
	private async savePriceSnapshots(): Promise<void> {
		if (this.priceSnapshots.size === 0) {
			console.log("📊 No price snapshots to save")
			return
		}

		try {
			const snapshots = Array.from(this.priceSnapshots.values())
			console.log(`💾 Saving ${snapshots.length} price snapshots to database...`)

			await createPriceSnapshots(snapshots)
			console.log(`✅ Saved ${snapshots.length} price snapshots`)

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
