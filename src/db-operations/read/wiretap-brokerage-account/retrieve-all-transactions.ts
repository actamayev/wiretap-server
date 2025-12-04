import PrismaClientClass from "../../../classes/prisma-client"

// eslint-disable-next-line max-lines-per-function
export default async function retrieveAllContracts(
	wiretapFundUuid: FundsUUID
): Promise<RetrievedUserTransactions | null> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		return await prismaClient.wiretap_fund.findUnique({
			where: {
				wiretap_fund_uuid: wiretapFundUuid
			},
			select: {
				purchase_orders: {
					select: {
						outcome_id: true,
						number_of_contracts: true,
						created_at: true,
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
				},
				sales_orders: {
					select: {
						outcome_id: true,
						number_of_contracts: true,
						created_at: true,
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
