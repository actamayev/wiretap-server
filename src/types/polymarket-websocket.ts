declare global {
	// ============================================
	// CLOB WebSocket - Market Channel Messages
	// ============================================

	/**
	 * Base type for all WebSocket messages
	 */

	type EventType = "book" | "price_change" | "last_trade_price" | "tick_size_change"
	interface PolymarketWebSocketMessage {
		event_type: EventType
		timestamp: string // Unix timestamp in milliseconds
	}

	/**
	 * Order book level summary
	 */
	interface OrderSummary {
		price: string // Price level (e.g., "0.48")
		size: string // Total size available at this price level (e.g., "30")
	}

	/**
	 * Full order book snapshot
	 * Emitted when first subscribing to a market or after significant changes
	 */
	interface PolymarketBookMessage extends PolymarketWebSocketMessage {
		event_type: "book"
		asset_id: ClobTokenId // Token ID (clob_token_id)
		market: string // Condition ID
		bids: OrderSummary[] // Buy orders, sorted by price descending
		asks: OrderSummary[] // Sell orders, sorted by price ascending
		hash: string // Hash summary of orderbook content
	}

	/**
	 * Individual price level change
	 */
	interface PriceChange {
		asset_id: ClobTokenId // Token ID (clob_token_id)
		price: string // Price level affected (e.g., "0.5")
		size: string // New aggregate size at this price level
		side: "BUY" | "SELL"
		hash: string // Hash of the order
		best_bid: string // Current best bid price after this change
		best_ask: string // Current best ask price after this change
	}

	/**
	 * Price change event (order placed or cancelled)
	 * Contains updates for one or more assets in a market
	 */
	interface PolymarketPriceChangeMessage extends PolymarketWebSocketMessage {
		event_type: "price_change"
		market: string // Condition ID
		price_changes: PriceChange[]
	}

	/**
	 * Trade execution event
	 * Emitted when a maker and taker order match
	 */
	interface PolymarketLastTradePriceMessage extends PolymarketWebSocketMessage {
		event_type: "last_trade_price"
		asset_id: ClobTokenId // Token ID (clob_token_id)
		market: string // Condition ID
		price: string // Execution price (e.g., "0.456")
		size: string // Size of the trade (e.g., "219.217767")
		side: "BUY" | "SELL"
		fee_rate_bps: string // Fee rate in basis points
	}

	/**
	 * Tick size change event
	 * Emitted when minimum tick size changes (at price boundaries 0.04 or 0.96)
	 */
	interface PolymarketTickSizeChangeMessage extends PolymarketWebSocketMessage {
		event_type: "tick_size_change"
		asset_id: ClobTokenId // Token ID (clob_token_id)
		market: string // Condition ID
		old_tick_size: string // Previous minimum tick size
		new_tick_size: string // New minimum tick size
		side: string // buy/sell
	}

	/**
	 * Union type for all market channel messages
	 */
	type PolymarketMarketChannelMessage =
		| PolymarketBookMessage
		| PolymarketPriceChangeMessage
		| PolymarketLastTradePriceMessage
		| PolymarketTickSizeChangeMessage

	// ============================================
	// WebSocket Subscription Messages
	// ============================================

	/**
	 * Message to subscribe to market channel
	 * Send this after opening the WebSocket connection
	 */
	interface MarketChannelSubscription {
		type: "market"
		assets_ids: ClobTokenId[] // Array of asset IDs (clob_token_ids) to monitor
	}

	// ============================================
	// Internal Types for Price Tracking
	// ============================================

	/**
	 * In-memory price data structure
	 * Stores the latest price data during each minute interval
	 */
	interface PriceSnapshot {
		clobTokenId: ClobTokenId
		bestBid: number | null
		bestAsk: number | null
		lastTradePrice: number | null
		timestamp: number // When this snapshot was last updated (Date.now())
	}
}

export {}
