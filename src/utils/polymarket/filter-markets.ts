import { MINIMUM_VOLUME } from "../constants"

export function isBinaryMarket(market: PolymarketMarket): boolean {
	try {
		// Check if required fields exist
		if (!market.outcomes || !market.clobTokenIds || !market.outcomePrices) {
			console.log(`  ⚠️  Market ${market.conditionId} missing outcome data`)
			return false
		}

		const outcomes = JSON.parse(market.outcomes)
		return outcomes.length === 2
	} catch (error) {
		console.log(`  ⚠️  Market ${market.conditionId} has invalid outcome data`)
		return false
	}
}

export function hasMinimumVolume(event: PolymarketEvent): boolean {
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
