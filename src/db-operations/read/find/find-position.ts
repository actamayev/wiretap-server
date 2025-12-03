import isNull from "lodash/isNull"
import PrismaClientClass from "../../../classes/prisma-client"

interface Position {
    positionId: number
    numberOfContractsHeld: number
    averageCostPerContract: number
}

export default async function findPosition(wiretapBrokerageAccountId: number, outcomeId: number): Promise<Position | null> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const position = await prismaClient.position.findUnique({
			where: {
				wiretap_brokerage_account_id_outcome_id: {
					wiretap_brokerage_account_id: wiretapBrokerageAccountId,
					outcome_id: outcomeId
				}
			},
			select: {
				position_id: true,
				number_contracts_held: true,
				average_cost_per_contract: true
			}
		})

		if (isNull(position)) return null

		return {
			positionId: position.position_id,
			numberOfContractsHeld: position.number_contracts_held,
			averageCostPerContract: position.average_cost_per_contract
		}
	} catch (error) {
		console.error("Error finding position:", error)
		throw error
	}
}
