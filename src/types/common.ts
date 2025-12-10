import { UUID } from "crypto"

declare global {
	type SuccessResponse = { success: string }
	type MessageResponse = { message: string }
	type ValidationErrorResponse = { validationError: string }
	type ErrorResponse = { error: string }
	type ErrorResponses = ValidationErrorResponse | ErrorResponse
	type NonSuccessResponse = MessageResponse | ErrorResponses
	type AllCommonResponses = SuccessResponse | NonSuccessResponse

	interface JwtPayload {
		userId: number
		username: string | null
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

	interface TransactionResponse {
		purchaseOrders: PurchaseOrder[]
		saleOrders: SaleOrder[]
	}

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
		transactions: TransactionResponse
	}

	interface AllMyFundsResponse {
		funds: SingleFund[]
	}

	interface CreateFundResponse {
		fundUUID: FundsUUID
	}

	interface IncomingLoginRequest {
		contact: string
		password: string
	}

	interface IncomingRegisterRequest {
		email: string
		password: string
		username: string
	}

	interface BasicPersonalInfoResponse {
		username: string
		email: string | null
		isGoogleUser: boolean
	}

	interface GoogleAuthSuccess {
		isNewUser: boolean
		personalInfo?: BasicPersonalInfoResponse
		funds: SingleFund[]
	}

	interface NewGoogleInfoRequest {
		username: string
	}

	interface NewGoogleUserResponse {
		email: string
		fund: SingleFund
	}

	interface EmailUpdatesRequest {
		email: string
	}

	interface SuccessBuyOrderResponse {
		success: "Buy order executed successfully"
		position: SinglePosition
		newAccountCashBalance: number
	}

	interface PolymarketOutcomeDataForTrade {
		outcome: OutcomeString
		marketQuestion: string | null
		polymarketSlug: EventSlug
		polymarketImageUrl: string
	}

	interface SuccessSellOrderResponse {
		success: "Sell order executed successfully"
		saleId: number
		positionClosed: boolean
		numberOfSharesSold: number
		pricePerShare: number
		totalProceeds: number
		realizedPnl: number
		newAccountCashBalance: number
		remainingPositions: SinglePosition[]
		outcomeData: PolymarketOutcomeDataForTrade
	}

	interface LoginSuccess {
		personalInfo: BasicPersonalInfoResponse
		funds: SingleFund[]
	}

	interface IncomingCreateFundRequest {
		fundName: string
		startingAccountCashBalanceUsd: number
	}

	interface AllEventsResponse {
		events: SingleEvent[]
	}

	interface SingleEventResponse {
		event: SingleEvent
	}

	interface SingleEvent {
		eventId: EventId
		eventSlug: EventSlug
		eventTitle: string
		eventDescription: string
		eventImageUrl: string
		eventIconUrl: string
		eventPolymarketUrl: string
		eventCreatedAt: Date
		eventUpdatedAt: Date
		eventMarkets: SingleMarket[]
		eventTotalVolume: number
		eventEndDate: Date
	}

	interface SingleMarket {
		marketId: MarketId
		marketQuestion: string | null
		marketCreatedAt: Date
		marketUpdatedAt: Date
		outcomes: SingleOutcome[]
		bestBid: number | null
		bestAsk: number | null
		lastTradePrice: number | null
		spread: number | null
	}

	interface SingleOutcome {
		outcome: OutcomeString
		clobTokenId: ClobTokenId
	}
}

export {}
