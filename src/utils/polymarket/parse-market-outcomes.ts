export function parseMarketOutcomes(market: PolymarketMarket): ParsedOutcome[] {
	try {
	  // 🔍 Debug: Log the raw data
	  console.log(`\n📊 Parsing market: ${market.conditionId}`)
	  console.log(`  Question: ${market.question}`)
	  console.log(`  Outcomes (raw): ${market.outcomes}`)
	  console.log(`  ClobTokenIds (raw): ${market.clobTokenIds}`)
	  console.log(`  OutcomePrices (raw): ${market.outcomePrices}`)

	  // ✅ Check if fields exist before parsing
	  if (!market.outcomes || !market.clobTokenIds || !market.outcomePrices) {
			console.warn(`⚠️  Skipping market ${market.conditionId} - missing required fields`)
			throw new Error(`Market missing required fields: outcomes=${market.outcomes}, clobTokenIds=${market.clobTokenIds}, outcomePrices=${market.outcomePrices}`)
	  }

	  const outcomes: string[] = JSON.parse(market.outcomes)
	  const clobTokenIds: string[] = JSON.parse(market.clobTokenIds)
	  const outcomePrices: string[] = JSON.parse(market.outcomePrices)

	  console.log("  Parsed outcomes:", outcomes)
	  console.log("  Parsed token IDs:", clobTokenIds)
	  console.log("  Parsed prices:", outcomePrices)

	  if (outcomes.length !== 2) {
			console.warn(`⚠️  Skipping market ${market.conditionId} - not binary (${outcomes.length} outcomes)`)
			throw new Error(`Expected binary market, got ${outcomes.length} outcomes`)
	  }

	  if (clobTokenIds.length !== 2 || outcomePrices.length !== 2) {
			throw new Error("Mismatched array lengths in market data")
	  }

	  const parsed = outcomes.map((outcome, index) => ({
			clobTokenId: clobTokenIds[index],
			outcome: outcome,
			outcomeIndex: index,
			currentPrice: outcomePrices[index] ? parseFloat(outcomePrices[index]) : null
	  }))

	  console.log(`✅ Successfully parsed ${parsed.length} outcomes`)
	  return parsed

	} catch (error) {
	  console.error(`❌ Failed to parse outcomes for market ${market.conditionId}:`, error)
	  throw new Error(`Invalid market data format for condition ${market.conditionId}`)
	}
}
