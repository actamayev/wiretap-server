import PrismaClientClass from "../../../classes/prisma-client"

export default async function retrieveBrokerageAccountBalance(wiretapFundUuid: FundsUUID): Promise<number | undefined> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const brokerageAccountBalance = await prismaClient.wiretap_fund.findUnique({
			where: {
				wiretap_fund_uuid: wiretapFundUuid
			},
			select: {
				current_account_balance_usd: true
			},
		})

		return brokerageAccountBalance?.current_account_balance_usd
	} catch (error) {
		console.error(error)
		throw error
	}
}
