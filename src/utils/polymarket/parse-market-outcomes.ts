export function parseMarketOutcomes(market: PolymarketMarket): ParsedOutcome[] {
	try {
	  // Check if fields exist before parsing
	  if (!market.outcomes || !market.clobTokenIds || !market.outcomePrices) {
			throw new Error("Market missing required fields")
	  }

	  const outcomes: string[] = JSON.parse(market.outcomes)
	  const clobTokenIds: string[] = JSON.parse(market.clobTokenIds)
	  const outcomePrices: string[] = JSON.parse(market.outcomePrices)

	  if (outcomes.length !== 2) {
			throw new Error(`Expected binary market, got ${outcomes.length} outcomes`)
	  }

	  if (clobTokenIds.length !== 2 || outcomePrices.length !== 2) {
			throw new Error("Mismatched array lengths in market data")
	  }

	  return outcomes.map((outcome, index) => ({
			clobTokenId: clobTokenIds[index],
			outcome: outcome,
			outcomeIndex: index,
			currentPrice: outcomePrices[index] ? parseFloat(outcomePrices[index]) : null
	  }))

	} catch (error) {
	  console.error(`Failed to parse market ${market.conditionId}:`, error instanceof Error ? error.message : error)
	  throw new Error(`Invalid market data format for condition ${market.conditionId}`)
	}
}
