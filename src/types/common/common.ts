import { UUID } from "crypto"

declare global {
	interface JwtPayload {
		userId: number
		isActive?: boolean
		iat?: number
		exp?: number
	}

	type FundsUUID = UUID & { readonly __brand: unique symbol }
	type EventId = string & { readonly __brand: unique symbol }
	type EventSlug = string & { readonly __brand: unique symbol }
	type MarketId = number & { readonly __brand: unique symbol }
	type OutcomeString = string & { readonly __brand: unique symbol }
	type ClobTokenId = string & { readonly __brand: unique symbol }

	interface CommonTransactionFields {
		outcome: OutcomeString
		transactionDate: Date
		marketQuestion: string | null
		polymarketSlug: EventSlug
		polymarketImageUrl: string
	}

	interface PurchaseOrder extends CommonTransactionFields {
		outcome: OutcomeString
		numberOfSharesPurchased: number
		marketQuestion: string | null
		totalCost: number
	}

	interface SaleOrder extends CommonTransactionFields {
		outcome: OutcomeString
		numberOfSharesSold: number
		marketQuestion: string | null
		totalProceeds: number
	}

	interface SinglePosition {
		outcome: OutcomeString
		marketQuestion: string | null
		numberOfSharesHeld: number
		clobToken: ClobTokenId
		costBasisPerShareUsd: number
		currentMarketPricePerShareUsd: number
		positionCreatedAt: Date
		polymarketSlug: EventSlug
		polymarketImageUrl: string
	}

	interface SingleFund {
		fundUUID: FundsUUID
		fundName: string
		fundCreatedAt: Date
		startingAccountCashBalanceUsd: number
		currentAccountCashBalanceUsd: number
		isPrimaryFund: boolean
		positionsValueUsd: number
		positions: SinglePosition[]
	}

	interface DetailedSingleFund {
		fundUUID: FundsUUID
		transactions: TransactionResponse
		portfolioHistory: SinglePortfolioSnapshot[]
	}

	interface SinglePortfolioSnapshot {
		timestamp: Date
		portfolioValueUsd: number
	}

	interface PolymarketOutcomeDataForTrade {
		outcome: OutcomeString
		marketQuestion: string | null
		polymarketSlug: EventSlug
		polymarketImageUrl: string
	}

	interface SingleEventMetadata {
		eventId: EventId
		eventSlug: EventSlug
		eventTitle: string
		eventDescription: string
		eventImageUrl: string
		eventIconUrl: string
		eventPolymarketUrl: string
		eventCreatedAt: Date
		eventUpdatedAt: Date
		eventTotalVolume: number
		eventEndDate: Date
		eventMarkets: SingleMarketMetadata[]
	}

	interface SingleMarketMetadata {
		marketId: MarketId
		marketQuestion: string | null
		marketCreatedAt: Date
		marketUpdatedAt: Date
		outcomes: SingleOutcomeMetadata[]
		midpointPrice: number | null
	}

	interface SingleOutcomeMetadata {
		outcome: OutcomeString
		outcomeIndex: number
		clobTokenId: ClobTokenId
	}

	type TimeWindow = "1H" | "1D" | "1W" | "1M" | "MAX"
}

export {}
