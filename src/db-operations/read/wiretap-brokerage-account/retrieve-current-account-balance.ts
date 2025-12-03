import PrismaClientClass from "../../../classes/prisma-client"

export default async function retrieveCurrentAccountBalance(wiretapBrokerageId: number): Promise<number | undefined> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const brokerageAccount = await prismaClient.wiretap_brokerage_account.findFirst({
			where: {
				wiretap_brokerage_account_id: wiretapBrokerageId
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
