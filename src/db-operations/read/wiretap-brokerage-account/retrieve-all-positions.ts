import PrismaClientClass from "../../../classes/prisma-client"

export default async function retrieveAllPositions(wiretapBrokerageAccountId: number): Promise<RetrievedUserPositions | null> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		return await prismaClient.wiretap_brokerage_account.findUnique({
			where: {
				wiretap_brokerage_account_id: wiretapBrokerageAccountId
			},
			select: {
				positions: {
					select: {
						outcome_id: true,
						number_contracts_held: true,
						outcome: {
							select: {
								market: {
									select: {
										question: true
									}
								}
							}
						}
					}
				}
			}
		})
	} catch (error) {
		console.error(error)
		throw error
	}
}
