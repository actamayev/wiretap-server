import { MINIMUM_VOLUME } from "../constants"

export function isBinaryMarket(market: PolymarketMarket): boolean {
	try {
		const outcomes = JSON.parse(market.outcomes)
		return outcomes.length === 2
	} catch {
		return false
	}
}

export function hasMinimumVolume(event: PolymarketEvent): boolean {
	return (event.volume ?? 0) >= MINIMUM_VOLUME
}

export function filterBinaryEvents(events: PolymarketEvent[]): PolymarketEvent[] {
	try {
		return events
			.filter(hasMinimumVolume)
			.map(event => ({
				...event,
				markets: event.markets.filter(isBinaryMarket)
			}))
			.filter(event => event.markets.length > 0)
	} catch (error) {
		console.error("Error filtering binary events:", error)
		return []
	}
}
