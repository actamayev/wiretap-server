import { isNull } from "lodash"
import PrismaClientClass from "../../../classes/prisma-client"
import retrieveFundPositions from "../position/retrieve-fund-positions"
import calculatePortfolioValue from "../../../utils/calculate-portfolio-value"

export default async function retrieveSingleFund(userId: number, wiretapFundUuid: FundsUUID): Promise<SingleFund | null> {
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
				is_primary_fund: true
			}
		})

		if (isNull(fund)) return null

		const positions = await retrieveFundPositions(fund.wiretap_fund_uuid as FundsUUID)

		const positionsValueUsd = await calculatePortfolioValue(positions)

		return {
			fundUUID: fund.wiretap_fund_uuid as FundsUUID,
			fundName: fund.fund_name,
			startingAccountCashBalanceUsd: fund.starting_account_balance_usd,
			currentAccountCashBalanceUsd: fund.current_account_balance_usd,
			isPrimaryFund: fund.is_primary_fund,
			positionsValueUsd,
			positions
		}
	} catch (error) {
		console.error(error)
		throw error
	}
}
