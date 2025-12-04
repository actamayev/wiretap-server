import PrismaClientClass from "../../../classes/prisma-client"

export default async function retrieveUserIdFromBrokerageId(wiretapFundUuid: FundsUUID): Promise<number | undefined> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const brokerageAccount = await prismaClient.wiretap_fund.findFirst({
			where: {
				wiretap_fund_uuid: wiretapFundUuid
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
