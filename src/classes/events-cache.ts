import Singleton from "./singleton"
import retrieveAllPolymarketEventsMetadata from "../db-operations/read/polymarket-event/retrieve-all-polymarket-events-metadata"

/**
 * Manages cached events data and periodic refresh
 * Events are stored in an array ordered by volume (descending - highest volume first)
 */
export default class EventsCache extends Singleton {
	private cachedEventsMetadata: SingleEventMetadata[] = []
	private refreshTimer: NodeJS.Timeout | null = null
	private readonly REFRESH_INTERVAL_MS = 60000 // 1 minute
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

		console.info("⏰ Starting events cache refresh timer (30s interval)")
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
		console.info("⏰ Stopped events cache refresh timer")
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
			console.info("🔄 Refreshing events cache...")
			const eventsMetadata = await retrieveAllPolymarketEventsMetadata()
			// Sort by volume descending (highest volume first)
			this.cachedEventsMetadata = eventsMetadata.sort((a, b) => b.eventTotalVolume - a.eventTotalVolume)
			console.info(`✅ Events cache refreshed (${this.cachedEventsMetadata.length} events)`)
		} catch (error) {
			console.error("❌ Failed to refresh events cache:", error)
			// Keep existing cache on error
		} finally {
			this.isRefreshing = false
		}
	}

	public async getSingleEventMetadataOrFetch(eventId: EventId): Promise<SingleEventMetadata | null> {
		const eventMetadata = this.cachedEventsMetadata.find(event => event.eventId === eventId)
		if (eventMetadata) return eventMetadata

		await this.getEventsMetadataOrFetch()
		return this.cachedEventsMetadata.find(event => event.eventId === eventId) ?? null
	}

	/**
	 * Get cached events or fetch if not available (for initial requests before cache is ready)
	 * Returns events ordered by volume (descending - highest volume first)
	 */
	public async getEventsMetadataOrFetch(): Promise<SingleEventMetadata[]> {
		if (this.cachedEventsMetadata.length > 0) {
			return this.cachedEventsMetadata
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
		return this.cachedEventsMetadata
	}
}
