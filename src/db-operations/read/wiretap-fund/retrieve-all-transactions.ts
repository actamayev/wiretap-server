import isNull from "lodash/isNull"
import PrismaClientClass from "../../../classes/prisma-client"

// eslint-disable-next-line max-lines-per-function
export default async function retrieveAllTransactions(
	wiretapFundUuid: FundsUUID
): Promise<TransactionResponse | null> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const rawUserTransactions = await prismaClient.wiretap_fund.findUnique({
			where: {
				wiretap_fund_uuid: wiretapFundUuid
			},
			select: {
				purchase_orders: {
					select: {
						outcome_id: true,
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
				},
				sales_orders: {
					select: {
						outcome_id: true,
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
				}
			}
		})

		if (isNull(rawUserTransactions)) return null

		return {
			purchaseOrders: rawUserTransactions.purchase_orders.map((purchaseOrder) => ({
				outcome: purchaseOrder.outcome.outcome as OutcomeString,
				transactionDate: purchaseOrder.created_at,
				numberContractsPurchased: purchaseOrder.number_of_contracts,
				marketQuestion: purchaseOrder.outcome.market.question,
			})),
			saleOrders: rawUserTransactions.sales_orders.map((saleOrder) => ({
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
