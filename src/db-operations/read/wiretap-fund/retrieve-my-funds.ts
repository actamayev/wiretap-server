import PrismaClientClass from "../../../classes/prisma-client"
import fetchCurrentTokenPrice from "../../../utils/polymarket/fetch-current-token-midpoint-price"

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
						number_shares_held: true,
						average_cost_per_share: true,
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
				}
			}
		})

		return (await Promise.all(funds.map(async (fund) => {
			const positions = await Promise.all(fund.positions.map(async (position) => ({
				clobToken: position.clob_token_id as ClobTokenId,
				outcome: position.outcome.outcome as OutcomeString,
				marketQuestion: position.outcome.market.question,
				numberOfSharesHeld: position.number_shares_held,
				costBasisPerShareUsd: position.average_cost_per_share,
				currentMarketPricePerShareUsd: await fetchCurrentTokenPrice(position.clob_token_id as ClobTokenId),
				positionCreatedAt: position.created_at,
				polymarketSlug: position.outcome.market.event.event_slug as EventSlug,
				polymarketImageUrl: position.outcome.market.event.image_url as string
			})))

			// Calculate portfolio value: sum of (numberOfSharesHeld * currentMarketPricePerShareUsd)
			const positionsValueUsd = positions.reduce(
				(sum, position) => sum + position.numberOfSharesHeld * position.currentMarketPricePerShareUsd,
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
				positions
			}
		})) satisfies SingleFund[])
	} catch (error) {
		console.error(error)
		throw error
	}
}
