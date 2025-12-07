import { MINIMUM_VOLUME } from "../constants"

function isBinaryMarket(market: PolymarketMarket): boolean {
	try {
		if (!market.outcomes || !market.clobTokenIds || !market.outcomePrices) {
			return false
		}

		const outcomes = JSON.parse(market.outcomes)
		return outcomes.length === 2
	} catch {
		return false
	}
}

function hasMinimumVolume(event: PolymarketEvent): boolean {
	return (event.volume ?? 0) >= MINIMUM_VOLUME
}

export function filterBinaryEvents(events: PolymarketEvent[]): PolymarketEvent[] {
	return events
		.filter(hasMinimumVolume)
		.map(event => ({
			...event,
			markets: event.markets.filter(isBinaryMarket)
		}))
		.filter(event => event.markets.length > 0)
}
