import PrismaClientClass from "../../../classes/prisma-client"

export default async function createStartingFundForUser(userId: number): Promise<SingleFund> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const uuid = crypto.randomUUID() as FundsUUID
		const startingAccountCashBalanceUsd = 10000

		const fund = await prismaClient.wiretap_fund.create({
			data: {
				user_id: userId,
				wiretap_fund_uuid: uuid,
				fund_name: "My First Fund",
				starting_account_balance_usd: startingAccountCashBalanceUsd,
				current_account_balance_usd: startingAccountCashBalanceUsd,
				is_primary_fund: true,
				is_starting_fund: true
			}
		})

		return {
			fundUUID: fund.wiretap_fund_uuid as FundsUUID,
			fundName: fund.fund_name,
			startingAccountCashBalanceUsd: fund.starting_account_balance_usd,
			currentAccountCashBalanceUsd: fund.current_account_balance_usd,
			isPrimaryFund: fund.is_primary_fund,
			positionsValueUsd: 0,
			positions: []
		} satisfies SingleFund
	} catch (error) {
		console.error(error)
		throw error
	}
}
