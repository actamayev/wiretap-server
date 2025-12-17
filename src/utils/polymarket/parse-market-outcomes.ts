export default function parseMarketOutcomes(market: PolymarketMarket): ParsedOutcome[] {
	try {
		if (!market.outcomes || !market.clobTokenIds) {
			throw new Error("Market missing required fields")
		}

		const outcomes: string[] = JSON.parse(market.outcomes)
		const clobTokenIds: ClobTokenId[] = JSON.parse(market.clobTokenIds)

		return outcomes.map((outcome, index) => ({
			clobTokenId: clobTokenIds[index],
			outcome: outcome as OutcomeString,
			outcomeIndex: index,
		}))
	} catch (error) {
		console.error(`Failed to parse market ${market.conditionId}:`, error instanceof Error ? error.message : error)
		throw new Error(`Invalid market data format for condition ${market.conditionId}`)
	}
}
