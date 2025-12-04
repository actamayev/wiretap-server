import PrismaClientClass from "../../../classes/prisma-client"

export default async function createWiretapFund(userId: number, fundName: string, startingAccountBalanceUsd: number): Promise<FundsUUID> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const uuid = crypto.randomUUID() as FundsUUID

		await prismaClient.wiretap_fund.create({
			data: {
				user_id: userId,
				wiretap_fund_uuid: uuid,
				fund_name: fundName,
				starting_account_balance_usd: startingAccountBalanceUsd,
				current_account_balance_usd: startingAccountBalanceUsd
			}
		})

		return uuid
	} catch (error) {
		console.error("Error creating wiretap fund:", error)
		throw error
	}
}
