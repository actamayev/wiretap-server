declare global {
	interface RetrievedUserTransactions {
		purchase_orders: {
			contract_uuid: string
			number_of_contracts: number
			created_at: Date
		}[]
		sales_orders: {
			contract_uuid: string
			number_of_contracts: number
			created_at: Date
		}[]
	}

	interface RetrievedUserPositions {
		positions: {
			contract_uuid: string
			number_contracts_held: number
		}[]
	}
}

export {}
