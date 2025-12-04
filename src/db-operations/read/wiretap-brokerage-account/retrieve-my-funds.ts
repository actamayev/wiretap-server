import PrismaClientClass from "../../../classes/prisma-client"

export default async function retrieveMyFunds(userId: number): Promise<RetrievedUserFunds | null> {
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

		return {
			funds: funds.map((fund) => ({
				fund_uuid: fund.wiretap_fund_uuid as FundsUUID,
				fund_name: fund.fund_name,
				starting_account_balance_usd: fund.starting_account_balance_usd,
				current_account_balance_usd: fund.current_account_balance_usd
			}))
		}
	} catch (error) {
		console.error(error)
		throw error
	}
}
