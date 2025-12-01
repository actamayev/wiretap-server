import PrismaClientClass from "../../../classes/prisma-client"

export default async function retrieveAllContracts(
	wiretapBrokerageAccountId: number
): Promise<RetrievedUserTransactions | null> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		return await prismaClient.wiretap_brokerage_account.findUnique({
			where: {
				wiretap_brokerage_account_id: wiretapBrokerageAccountId
			},
			select: {
				purchase_orders: {
					select: {
						contract_uuid: true,
						number_of_contracts: true,
						created_at: true
					}
				},
				sales_orders: {
					select: {
						contract_uuid: true,
						number_of_contracts: true,
						created_at: true
					}
				}
			}
		})
	} catch (error) {
		console.error(error)
		throw error
	}
}
