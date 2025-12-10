import PrismaClientClass from "../../../classes/prisma-client"

interface FundWithPositions {
	wiretapFundUuid: FundsUUID
	currentAccountBalanceUsd: number
}

export default async function getFundsWithPositions(): Promise<FundWithPositions[]> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const funds = await prismaClient.wiretap_fund.findMany({
			where: {
				positions: {
					some: {
						number_shares_held: {
							gt: 0
						}
					}
				}
			},
			select: {
				wiretap_fund_uuid: true,
				current_account_balance_usd: true
			}
		})

		return funds.map(fund => ({
			wiretapFundUuid: fund.wiretap_fund_uuid as FundsUUID,
			currentAccountBalanceUsd: fund.current_account_balance_usd
		}))
	} catch (error) {
		console.error("Error fetching funds with positions:", error)
		throw error
	}
}
