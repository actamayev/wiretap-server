import Singleton from "./singleton"
import retrieveAllPolymarketEvents from "../db-operations/read/polymarket-event/retrieve-all-polymarket-events"

/**
 * Manages cached events data and periodic refresh
 */
export default class EventsCache extends Singleton {
	private cachedEvents: SingleEvent[] | null = null
	private refreshTimer: NodeJS.Timeout | null = null
	private readonly REFRESH_INTERVAL_MS = 30000 // 30 seconds
	private isRefreshing = false

	private constructor() {
		super()
	}

	public static override getInstance(): EventsCache {
		if (EventsCache.instance === null) {
			EventsCache.instance = new EventsCache()
		}
		return EventsCache.instance
	}

	/**
	 * Start the refresh timer
	 */
	public startRefreshTimer(): void {
		if (this.refreshTimer) return // Already started

		console.log("⏰ Starting events cache refresh timer (30s interval)")
		void this.refreshEvents() // Initial fetch
		this.scheduleNextRefresh()
	}

	/**
	 * Stop the refresh timer
	 */
	public stopRefreshTimer(): void {
		if (!this.refreshTimer) return
		clearInterval(this.refreshTimer)
		this.refreshTimer = null
		console.log("⏰ Stopped events cache refresh timer")
	}

	/**
	 * Schedule the next refresh
	 */
	private scheduleNextRefresh(): void {
		this.refreshTimer = setInterval(() => {
			void this.refreshEvents()
		}, this.REFRESH_INTERVAL_MS)
	}

	/**
	 * Refresh the cached events data
	 */
	private async refreshEvents(): Promise<void> {
		if (this.isRefreshing) return // Prevent concurrent refreshes

		this.isRefreshing = true
		try {
			console.log("🔄 Refreshing events cache...")
			this.cachedEvents = await retrieveAllPolymarketEvents()
			console.log(`✅ Events cache refreshed (${this.cachedEvents.length} events)`)
		} catch (error) {
			console.error("❌ Failed to refresh events cache:", error)
			// Keep existing cache on error
		} finally {
			this.isRefreshing = false
		}
	}

	/**
	 * Get cached events (returns null if cache hasn't been populated yet)
	 */
	public getEvents(): SingleEvent[] | null {
		return this.cachedEvents
	}

	/**
	 * Get cached events or fetch if not available (for initial requests before cache is ready)
	 */
	public async getEventsOrFetch(): Promise<SingleEvent[]> {
		if (this.cachedEvents) {
			return this.cachedEvents
		}

		// If cache is empty, fetch immediately
		if (!this.isRefreshing) {
			await this.refreshEvents()
		}

		// Wait for refresh if it's in progress
		while (this.isRefreshing) {
			await new Promise(resolve => setTimeout(resolve, 100))
		}

		// Return cached events or empty array if refresh failed
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (this.cachedEvents) {
			return this.cachedEvents
		}
		return []
	}
}
