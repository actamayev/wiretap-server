declare global {
	interface PriceSnapshot {
		clobTokenId: ClobTokenId
		bestBid: number | null
		bestAsk: number | null
		midpointPrice: number | null
		lastTradePrice: number | null
		timestamp: number // Unix timestamp in milliseconds
	}
}

export {}
