import PrismaClientClass from "../../../classes/prisma-client"

// eslint-disable-next-line max-lines-per-function
export default async function retrieveAllTransactions(wiretapFundUuid: FundsUUID): Promise<TransactionResponse> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		// eslint-disable-next-line max-lines-per-function
		const result = await prismaClient.$transaction(async (tx: TransactionClient) => {
			// Query purchase orders
			const purchaseOrders = await tx.purchase_order.findMany({
				where: {
					wiretap_fund_uuid: wiretapFundUuid
				},
				select: {
					number_of_contracts: true,
					created_at: true,
					outcome: {
						select: {
							outcome: true,
							market: {
								select: {
									question: true
								}
							}
						}
					}
				}
			})

			// Query sales orders
			const salesOrders = await tx.sale_order.findMany({
				where: {
					wiretap_fund_uuid: wiretapFundUuid
				},
				select: {
					number_of_contracts: true,
					created_at: true,
					outcome: {
						select: {
							outcome: true,
							market: {
								select: {
									question: true
								}
							}
						}
					}
				}
			})

			return {
				purchaseOrders,
				salesOrders
			}
		})

		return {
			purchaseOrders: result.purchaseOrders.map((purchaseOrder) => ({
				outcome: purchaseOrder.outcome.outcome as OutcomeString,
				transactionDate: purchaseOrder.created_at,
				numberContractsPurchased: purchaseOrder.number_of_contracts,
				marketQuestion: purchaseOrder.outcome.market.question,
			})),
			saleOrders: result.salesOrders.map((saleOrder) => ({
				outcome: saleOrder.outcome.outcome as OutcomeString,
				transactionDate: saleOrder.created_at,
				numberContractsSold: saleOrder.number_of_contracts,
				marketQuestion: saleOrder.outcome.market.question,
			})),
		}
	} catch (error) {
		console.error(error)
		throw error
	}
}
