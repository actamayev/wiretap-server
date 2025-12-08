import PrismaClientClass from "../../../classes/prisma-client"

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
				current_account_balance_usd: true
			}
		})

		return funds.map((fund) => ({
			fundUUID: fund.wiretap_fund_uuid as FundsUUID,
			fundName: fund.fund_name,
			startingAccountBalanceUsd: fund.starting_account_balance_usd,
			currentAccountBalanceUsd: fund.current_account_balance_usd
		}))
	} catch (error) {
		console.error(error)
		throw error
	}
}
