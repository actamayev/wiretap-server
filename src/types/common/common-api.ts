declare global {
	type SuccessResponse = { success: string }
	type MessageResponse = { message: string }
	type ValidationErrorResponse = { validationError: string }
	type ErrorResponse = { error: string }
	type ErrorResponses = ValidationErrorResponse | ErrorResponse
	type NonSuccessResponse = MessageResponse | ErrorResponses
	type AllCommonResponses = SuccessResponse | NonSuccessResponse

	interface IncomingAuthRequest {
		email: string
		password: string
	}

	interface BasicPersonalInfoResponse {
		email: string | null
		isGoogleUser: boolean
	}

	interface GoogleAuthSuccess {
		isNewUser: boolean
		personalInfo: BasicPersonalInfoResponse
		funds: SingleFund[]
	}

	interface LoginSuccess {
		personalInfo: BasicPersonalInfoResponse
		funds: SingleFund[]
	}

	interface TransactionResponse {
		purchaseOrders: PurchaseOrder[]
		saleOrders: SaleOrder[]
	}

	interface AllMyFundsResponse {
		funds: SingleFund[]
	}

	interface DetailedSingleFundResponse {
		fund: DetailedSingleFund
	}

	interface SinglePortfolioSnapshotResponse {
		portfolioHistory: SinglePortfolioSnapshot[]
	}

	interface CreateFundResponse {
		fundUUID: FundsUUID
	}

	interface SuccessBuyOrderResponse {
		success: "Buy order executed successfully"
		position: SinglePosition
		newAccountCashBalance: number
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

	interface IncomingCreateFundRequest {
		fundName: string
		startingAccountCashBalanceUsd: number
	}

	interface AllEventsResponse {
		events: SingleEventMetadata[]
	}

	interface SingleEventResponse {
		event: SingleEventMetadata
	}
}

export {}
