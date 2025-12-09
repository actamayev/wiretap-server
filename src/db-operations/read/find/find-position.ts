import { isNil } from "lodash"
import PrismaClientClass from "../../../classes/prisma-client"

interface Position {
    numberOfContractsHeld: number
    totalCostOfContractsSelling: number
}

// eslint-disable-next-line max-lines-per-function
export default async function findPosition(
	wiretapFundUuid: FundsUUID,
	clobToken: ClobTokenId,
	numberOfContractsSelling: number
): Promise<Position | null> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		// Retrieve all positions for this contract, ordered by created_at (FIFO - oldest first)
		const positions = await prismaClient.position.findMany({
			where: {
				wiretap_fund_uuid: wiretapFundUuid,
				clob_token_id: clobToken
			},
			select: {
				position_id: true,
				number_contracts_held: true,
				average_cost_per_contract: true,
				created_at: true
			},
			orderBy: {
				created_at: "asc"
			}
		})

		if (isNil(positions)) return null

		// Calculate total contracts held
		let totalNumberOfContractsHeld = 0
		for (const position of positions) {
			totalNumberOfContractsHeld += position.number_contracts_held
		}

		// Calculate FIFO total cost for the contracts being sold
		let contractsRemainingToSell = numberOfContractsSelling
		let totalCostForContractsSelling = 0

		for (const position of positions) {
			if (contractsRemainingToSell <= 0) break

			const contractsToTakeFromThisPosition = Math.min(
				position.number_contracts_held,
				contractsRemainingToSell
			)

			const costFromThisPosition =
				contractsToTakeFromThisPosition * position.average_cost_per_contract

			totalCostForContractsSelling += costFromThisPosition
			contractsRemainingToSell -= contractsToTakeFromThisPosition
		}

		return {
			numberOfContractsHeld: totalNumberOfContractsHeld,
			totalCostOfContractsSelling: totalCostForContractsSelling
		} satisfies Position
	} catch (error) {
		console.error("Error finding position:", error)
		throw error
	}
}
