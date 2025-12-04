import PrismaClientClass from "../../../classes/prisma-client"

export default async function retrieveAllPositions(wiretapFundUuid: FundsUUID): Promise<RetrievedUserPositions | null> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		return await prismaClient.wiretap_fund.findUnique({
			where: {
				wiretap_fund_uuid: wiretapFundUuid
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
