export default function transformRawUserTransactions(rawUserTransactions: RetrievedUserTransactions): TransactionResponse {
	try {
		return {
			purchaseOrders: rawUserTransactions.purchase_orders.map((purchaseOrder) => ({
				outcomeId: purchaseOrder.outcome_id,
				transactionDate: purchaseOrder.created_at,
				numberContractsPurchased: purchaseOrder.number_of_contracts,
				marketQuestion: purchaseOrder.outcome.market.question
			})),
			saleOrders: rawUserTransactions.sales_orders.map((saleOrder) => ({
				outcomeId: saleOrder.outcome_id,
				transactionDate: saleOrder.created_at,
				numberContractsSold: saleOrder.number_of_contracts,
				marketQuestion: saleOrder.outcome.market.question
			}))
		}
	} catch (error) {
		console.error(error)
		throw Error
	}
}
