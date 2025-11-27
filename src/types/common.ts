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
		transactions: (PurchaseOrder | SaleOrder)[]
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
}

export {}
