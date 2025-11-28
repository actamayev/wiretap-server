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
		contractUUID: ContractUUID
		transactionDate: Date
	}

	interface PurchaseOrder extends CommonTransactionFields {
		numberContractsPurchased: number
	}

	interface SaleOrder extends CommonTransactionFields {
		numberContractsSold: number
	}

	interface SinglePosition {
		contractUUID: ContractUUID
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
