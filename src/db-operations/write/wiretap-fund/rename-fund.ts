import PrismaClientClass from "../../../classes/prisma-client"

export default async function renameWiretapFund(wiretapFundUuid: FundsUUID, newFundName: string): Promise<void> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		await prismaClient.wiretap_fund.update({
			where: {
				wiretap_fund_uuid: wiretapFundUuid
			},
			data: {
				fund_name: newFundName
			}
		})
	} catch (error) {
		console.error("Error renaming wiretap fund:", error)
		throw error
	}
}
