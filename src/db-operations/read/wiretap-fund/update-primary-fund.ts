import PrismaClientClass from "../../../classes/prisma-client"

export default async function updatePrimaryFund(userId: number, wiretapFundUuid: FundsUUID): Promise<void> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		await prismaClient.$transaction([
			prismaClient.wiretap_fund.update({
				data: {
					is_primary_fund: true
				},
				where: {
					wiretap_fund_uuid: wiretapFundUuid
				}
			}),
			prismaClient.wiretap_fund.updateMany({
				data: {
					is_primary_fund: false
				},
				where: {
					user_id: userId,
					wiretap_fund_uuid: { not: wiretapFundUuid }
				}
			})
		])
	} catch (error) {
		console.error(error)
		throw error
	}
}
