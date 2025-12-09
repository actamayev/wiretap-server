import { isEmpty } from "lodash"
import PrismaClientClass from "../../../classes/prisma-client"
import calculatePortfolioValue from "../../../utils/calculate-portfolio-value"

// eslint-disable-next-line max-lines-per-function
export default async function retrieveMyFunds(userId: number): Promise<SingleFund[]> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const funds = await prismaClient.wiretap_fund.findMany({
			where: {
				user_id: userId
			},
			select: {
				wiretap_fund_uuid: true,
				fund_name: true,
				starting_account_balance_usd: true,
				current_account_balance_usd: true,
				is_primary_fund: true,
				created_at: true,
				positions: {
					select: {
						clob_token_id: true,
						number_contracts_held: true,
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
				purchase_orders: {
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
				},
				sales_orders: {
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
				}
			}
		})

		if (isEmpty(funds)) return []

		const transformedFunds: SingleFund[] = funds.map((fund) => ({
			fundUUID: fund.wiretap_fund_uuid as FundsUUID,
			fundName: fund.fund_name,
			fundCreatedAt: fund.created_at,
			startingAccountCashBalanceUsd: fund.starting_account_balance_usd,
			currentAccountCashBalanceUsd: fund.current_account_balance_usd,
			isPrimaryFund: fund.is_primary_fund,
			positionsValueUsd: 0,
			positions: fund.positions.map((position) => ({
				clobToken: position.clob_token_id as ClobTokenId,
				outcome: position.outcome.outcome as OutcomeString,
				marketQuestion: position.outcome.market.question,
				numberOfContractsHeld: position.number_contracts_held,
			})),
			transactions: {
				purchaseOrders: fund.purchase_orders.map((purchaseOrder) => ({
					outcome: purchaseOrder.outcome.outcome as OutcomeString,
					transactionDate: purchaseOrder.created_at,
					numberContractsPurchased: purchaseOrder.number_of_contracts,
					marketQuestion: purchaseOrder.outcome.market.question,
				})),
				saleOrders: fund.sales_orders.map((saleOrder) => ({
					outcome: saleOrder.outcome.outcome as OutcomeString,
					transactionDate: saleOrder.created_at,
					numberContractsSold: saleOrder.number_of_contracts,
					marketQuestion: saleOrder.outcome.market.question,
				}))
			}
		}))

		// Calculate portfolio value for each fund in parallel
		const portfolioValues = await Promise.all(
			transformedFunds.map((fund) => calculatePortfolioValue(fund.positions))
		)

		transformedFunds.forEach((fund, index) => {
			fund.positionsValueUsd = portfolioValues[index]
		})

		return transformedFunds
	} catch (error) {
		console.error(error)
		throw error
	}
}
