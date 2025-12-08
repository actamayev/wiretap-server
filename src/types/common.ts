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

	interface TransactionResponse {
		purchaseOrders: PurchaseOrder[]
		saleOrders: SaleOrder[]
	}

	interface CommonTransactionFields {
		outcome: OutcomeString
		transactionDate: Date
		marketQuestion: string | null
	}

	interface PurchaseOrder extends CommonTransactionFields {
		outcome: OutcomeString
		numberContractsPurchased: number
		marketQuestion: string | null
	}

	interface SaleOrder extends CommonTransactionFields {
		outcome: OutcomeString
		numberContractsSold: number
		marketQuestion: string | null
	}

	interface SinglePosition {
		outcome: OutcomeString
		marketQuestion: string | null
		numberOfContractsHeld: number
	}

	interface SingleFund {
		fundUUID: FundsUUID
		fundName: string
		startingAccountBalanceUsd: number
		currentAccountBalanceUsd: number
	}

	interface PositionsResponse {
		positions: SinglePosition[]
	}

	interface AllMyFundsResponse {
		funds: SingleFund[]
	}

	interface SingleFundResponse {
		singleFund: SingleFund | null
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
	}

	interface NewGoogleInfoRequest {
		username: string
	}

	interface EmailResponse {
		email: string
	}

	interface SuccessBuyOrderResponse {
		success: "Buy order executed successfully"
		pricePerContract: number
		totalCost: number
		newAccountBalance: number
	}

	interface SuccessSellOrderResponse {
		success: "Sell order executed successfully"
		saleId: number
		positionClosed: boolean
		contractsSold: number
		pricePerContract: number
		totalProceeds: number
		realizedPnl: number
		newAccountBalance: number
	}

	interface EmailUpdatesRequest {
		email: string
	}

	interface LoginSuccess {
		personalInfo: BasicPersonalInfoResponse
	}

	interface IncomingCreateFundRequest {
		fundName: string
		startingAccountBalanceUsd: number
	}

	interface AllEventsResponse {
		events: SingleEvent[]
	}

	interface SingleEventResponse {
		event: SingleEvent | null
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
	}

	interface SingleMarket {
		marketId: MarketId
		marketQuestion: string | null
		marketCreatedAt: Date
		marketUpdatedAt: Date
		lastTradePrice: number | null
	}
}

export {}
