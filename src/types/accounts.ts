declare global {
	interface RetrievedUserTransactions {
		purchase_orders: {
			outcome_id: number
			number_of_contracts: number
			created_at: Date
			outcome: {
				market: {
					question: string
				}
			}
		}[]
		sales_orders: {
			outcome_id: number
			number_of_contracts: number
			created_at: Date
			outcome: {
				market: {
					question: string
				}
			}
		}[]
	}

	interface RetrievedUserPositions {
		positions: {
			outcome_id: number
			number_contracts_held: number
			outcome: {
				market: {
					question: string
				}
			}
		}[]
	}
}

export {}
