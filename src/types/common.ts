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

	interface PositionsResponse {
		positions: SinglePosition[]
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
}

export {}
