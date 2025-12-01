import PrismaClientClass from "../../../classes/prisma-client"

export default async function retrieveBrokerageAccountBalance(wiretapBrokerageId: number): Promise<number | undefined> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const brokerageAccountBalance = await prismaClient.wiretap_brokerage_account.findUnique({
			where: {
				wiretap_brokerage_account_id: wiretapBrokerageId
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
