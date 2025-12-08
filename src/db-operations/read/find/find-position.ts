import isNull from "lodash/isNull"
import PrismaClientClass from "../../../classes/prisma-client"

interface Position {
    numberOfContractsHeld: number
    averageCostPerContract: number
}

export default async function findPosition(wiretapFundUuid: FundsUUID, clobToken: ClobTokenId): Promise<Position | null> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const positions = await prismaClient.position.findMany({
			where: {
				wiretap_fund_uuid: wiretapFundUuid,
				clob_token_id: clobToken
			},
			select: {
				position_id: true,
				number_contracts_held: true,
				average_cost_per_contract: true
			}
		})

		if (isNull(positions)) return null

		if (positions.length === 0) return null

		let totalNumberOfContractsHeld = 0
		let totalAverageCostPerContract = 0

		for (const position of positions) {
			totalNumberOfContractsHeld += position.number_contracts_held
			totalAverageCostPerContract += position.average_cost_per_contract
		}

		const averageCostPerContract = totalAverageCostPerContract / positions.length

		return {
			numberOfContractsHeld: totalNumberOfContractsHeld,
			averageCostPerContract: averageCostPerContract as number
		} satisfies Position
	} catch (error) {
		console.error("Error finding position:", error)
		throw error
	}
}
