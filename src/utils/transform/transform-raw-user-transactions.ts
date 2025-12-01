export default function transformRawUserTransactions(rawUserTransactions: RetrievedUserTransactions): TransactionResponse {
	try {
		return {
			purchaseOrders: rawUserTransactions.purchase_orders.map((purchaseOrder) => ({
				contractUUID: purchaseOrder.contract_uuid as ContractUUID,
				transactionDate: purchaseOrder.created_at,
				numberContractsPurchased: purchaseOrder.number_of_contracts
			})),
			saleOrders: rawUserTransactions.sales_orders.map((saleOrder) => ({
				contractUUID: saleOrder.contract_uuid as ContractUUID,
				transactionDate: saleOrder.created_at,
				numberContractsSold: saleOrder.number_of_contracts
			}))
		}
	} catch (error) {
		console.error(error)
		throw Error
	}
}
