import PrismaClientClass from "../../../classes/prisma-client"

export default async function retrieveCurrentAccountBalance(wiretapFundUuid: FundsUUID): Promise<number | undefined> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const brokerageAccount = await prismaClient.wiretap_fund.findFirst({
			where: {
				wiretap_fund_uuid: wiretapFundUuid
			},
			select: {
				current_account_balance_usd: true
			},
		})

		return brokerageAccount?.current_account_balance_usd
	} catch (error) {
		console.error(error)
		throw error
	}
}
