declare global {
	interface RetrievedUserTransactions {
		purchase_orders: {
			outcome_id: number
			number_of_shares: number
			created_at: Date
			outcome: {
				outcome: OutcomeString
				market: {
					question: string
				}
			}
		}[]
		sales_orders: {
			outcome_id: number
			number_of_shares: number
			created_at: Date
			outcome: {
				outcome: OutcomeString
				market: {
					question: string
				}
			}
		}[]
	}

	interface RetrievedUserPositions {
		positions: {
			outcome_id: number
			number_shares_held: number
			outcome: {
				market: {
					question: string
				}
			}
		}[]
	}

	interface RetrievedUserFunds {
		funds: {
			fund_uuid: FundsUUID
			fund_name: string
			starting_account_balance_usd: number
			current_account_balance_usd: number
		}[]
	}
}

export {}
