import { isNull } from "lodash"
import PrismaClientClass from "../../../classes/prisma-client"
import calculatePortfolioValue from "../../../utils/calculate-portfolio-value"

// eslint-disable-next-line max-lines-per-function
export default async function retrieveSingleFund(wiretapFundUuid: FundsUUID): Promise<SingleFund | null> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const fund = await prismaClient.wiretap_fund.findUnique({
			where: {
				wiretap_fund_uuid: wiretapFundUuid
			},
			select: {
				wiretap_fund_uuid: true,
				fund_name: true,
				starting_account_balance_usd: true,
				current_account_balance_usd: true,
				is_primary_fund: true,
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
				}
			}
		})

		if (isNull(fund)) return null

		const positionsValueUsd = await calculatePortfolioValue(fund.positions.map((position) => ({
			clobToken: position.clob_token_id as ClobTokenId,
			outcome: position.outcome.outcome as OutcomeString,
			marketQuestion: position.outcome.market.question,
			numberOfContractsHeld: position.number_contracts_held,
		})))

		return {
			fundUUID: fund.wiretap_fund_uuid as FundsUUID,
			fundName: fund.fund_name,
			startingAccountCashBalanceUsd: fund.starting_account_balance_usd,
			currentAccountCashBalanceUsd: fund.current_account_balance_usd,
			isPrimaryFund: fund.is_primary_fund,
			positionsValueUsd,
			positions: fund.positions.map((position) => ({
				clobToken: position.clob_token_id as ClobTokenId,
				outcome: position.outcome.outcome as OutcomeString,
				marketQuestion: position.outcome.market.question,
				numberOfContractsHeld: position.number_contracts_held,
			}))
		}
	} catch (error) {
		console.error(error)
		throw error
	}
}
