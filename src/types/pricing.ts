declare global {
	interface PriceSnapshot {
		clobTokenId: ClobTokenId
		bestBid: number | null
		bestAsk: number | null
		midpointPrice: number | null
		lastTradePrice: number | null
		timestamp: number // When this snapshot was last updated (Date.now())
	}
}

export {}
