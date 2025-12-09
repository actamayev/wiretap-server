import isNull from "lodash/isNull"
import PrismaClientClass from "../../../classes/prisma-client"

export default async function retrievePrimaryFundPositions(wiretapFundUuid: FundsUUID): Promise<SinglePosition[]> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const rawUserPositions = await prismaClient.position.findMany({
			where: {
				wiretap_fund_uuid: wiretapFundUuid
			},
			select: {
				clob_token_id: true,
				number_contracts_held: true,
				outcome: {
					select: {
						outcome: true,
						market: {
							select: {
								question: true
							}
						}
					}
				}
			}
		})

		if (isNull(rawUserPositions)) return []

		return rawUserPositions.map((position) => ({
			outcome: position.outcome.outcome as OutcomeString,
			marketQuestion: position.outcome.market.question,
			numberOfContractsHeld: position.number_contracts_held,
		}))
	} catch (error) {
		console.error(error)
		throw error
	}
}
