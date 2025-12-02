declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		interface Request {
			userId: number
			user: ExtendedCredentials
			wiretapBrokerageAccountId: number
			validatedOrder?: {
				wiretapBrokerageAccountId: number
				outcomeId: number
				numberOfContracts: number
				currentPrice: number
				positionAverageCost?: number  // Only present for sell orders
			}

		}
	}
}

export {}
