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
	type EventUUID = UUID & { readonly __brand: unique symbol }

	type ContractUUID = UUID & { readonly __brand: unique symbol }

	interface TransactionResponse {
		purchaseOrders: PurchaseOrder[]
		saleOrders: SaleOrder[]
	}

	interface CommonTransactionFields {
		outcomeId: number
		transactionDate: Date
		marketQuestion: string
	}

	interface PurchaseOrder extends CommonTransactionFields {
		outcomeId: number
		numberContractsPurchased: number
		marketQuestion: string
	}

	interface SaleOrder extends CommonTransactionFields {
		outcomeId: number
		numberContractsSold: number
		marketQuestion: string
	}

	interface SinglePosition {
		outcomeId: number
		marketQuestion: string
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
}

export {}
