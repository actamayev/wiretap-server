import PrismaClientClass from "../../../classes/prisma-client"

export default async function retrieveUserIdFromBrokerageId(wiretapBrokerageId: number): Promise<number | undefined> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const brokerageAccount = await prismaClient.wiretap_brokerage_account.findFirst({
			where: {
				wiretap_brokerage_account_id: wiretapBrokerageId
			},
			select: {
				user_id: true
			},
		})

		return brokerageAccount?.user_id
	} catch (error) {
		console.error(error)
		throw error
	}
}
