import fetchPolymarketPrice from "./polymarket/fetch-current-price"

export default async function calculatePortfolioValue(positions: SinglePosition[]): Promise<number> {
	try {
		// Extract unique clob token IDs
		const uniqueClobTokens = [...new Set(positions.map((position) => position.clobToken))]

		// Fetch prices for all unique clob tokens in parallel
		const pricePromises = uniqueClobTokens.map((clobToken) =>
			fetchPolymarketPrice(clobToken)
		)
		const prices = await Promise.all(pricePromises)

		// Create a map of clobToken -> price
		const priceMap = new Map<ClobTokenId, number>()
		uniqueClobTokens.forEach((clobToken, index) => {
			const price = prices[index]
			if (price !== null) {
				priceMap.set(clobToken, price)
			}
		})

		// Calculate portfolio value by multiplying each position's contracts by its price
		let positionsValueUsd = 0
		for (const position of positions) {
			const price = priceMap.get(position.clobToken)
			if (price !== undefined) {
				positionsValueUsd += price * position.numberOfContractsHeld
			}
		}

		return positionsValueUsd
	} catch (error) {
		console.error(error)
		throw error
	}
}
