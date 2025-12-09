import { isEmpty } from "lodash"
import PrismaClientClass from "../../../classes/prisma-client"
import fetchPolymarketPrice from "../../../utils/polymarket/fetch-current-price"

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
						average_cost_per_contract: true,
						created_at: true,
						outcome: {
							select: {
								outcome: true,
								market: {
									select: {
										question: true,
										event: {
											select: {
												event_slug: true,
												image_url: true
											}
										}
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
						total_cost: true,
						outcome: {
							select: {
								outcome: true,
								market: {
									select: {
										question: true,
										event: {
											select: {
												event_slug: true,
												image_url: true
											}
										}
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
						total_proceeds: true,
						outcome: {
							select: {
								outcome: true,
								market: {
									select: {
										question: true,
										event: {
											select: {
												event_slug: true,
												image_url: true
											}
										}
									}
								}
							}
						}
					}
				}
			}
		})

		if (isEmpty(funds)) return []

		const transformedFunds: SingleFund[] = await Promise.all(
			// eslint-disable-next-line max-lines-per-function
			funds.map(async (fund) => {
				const positions = await Promise.all(
					fund.positions.map(async (position) => ({
						clobToken: position.clob_token_id as ClobTokenId,
						outcome: position.outcome.outcome as OutcomeString,
						marketQuestion: position.outcome.market.question,
						numberOfContractsHeld: position.number_contracts_held,
						costBasisPerContractUsd: position.average_cost_per_contract,
						currentMarketPricePerContractUsd: await fetchPolymarketPrice(position.clob_token_id as ClobTokenId) as number,
						positionCreatedAt: position.created_at,
						polymarketSlug: position.outcome.market.event.event_slug as EventSlug,
						polymarketImageUrl: position.outcome.market.event.image_url as string
					}))
				)

				// Calculate portfolio value: sum of (numberOfContractsHeld * currentMarketPricePerContractUsd)
				const positionsValueUsd = positions.reduce(
					(sum, position) => sum + position.numberOfContractsHeld * position.currentMarketPricePerContractUsd,
					0
				)

				return {
					fundUUID: fund.wiretap_fund_uuid as FundsUUID,
					fundName: fund.fund_name,
					fundCreatedAt: fund.created_at,
					startingAccountCashBalanceUsd: fund.starting_account_balance_usd,
					currentAccountCashBalanceUsd: fund.current_account_balance_usd,
					isPrimaryFund: fund.is_primary_fund,
					positionsValueUsd,
					positions,
					transactions: {
						purchaseOrders: fund.purchase_orders.map((purchaseOrder) => ({
							outcome: purchaseOrder.outcome.outcome as OutcomeString,
							transactionDate: purchaseOrder.created_at,
							numberContractsPurchased: purchaseOrder.number_of_contracts,
							marketQuestion: purchaseOrder.outcome.market.question,
							polymarketSlug: purchaseOrder.outcome.market.event.event_slug as EventSlug,
							polymarketImageUrl: purchaseOrder.outcome.market.event.image_url as string,
							totalCost: purchaseOrder.total_cost,
						})),
						saleOrders: fund.sales_orders.map((saleOrder) => ({
							outcome: saleOrder.outcome.outcome as OutcomeString,
							transactionDate: saleOrder.created_at,
							numberContractsSold: saleOrder.number_of_contracts,
							marketQuestion: saleOrder.outcome.market.question,
							polymarketSlug: saleOrder.outcome.market.event.event_slug as EventSlug,
							polymarketImageUrl: saleOrder.outcome.market.event.image_url as string,
							totalProceeds: saleOrder.total_proceeds,
						}))
					}
				}
			})
		)

		return transformedFunds
	} catch (error) {
		console.error(error)
		throw error
	}
}
