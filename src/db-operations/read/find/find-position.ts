import { isNil } from "lodash"
import PrismaClientClass from "../../../classes/prisma-client"

interface Position {
    numberOfSharesHeld: number
    totalCostOfSharesSelling: number
}

// eslint-disable-next-line max-lines-per-function
export default async function findPosition(
	wiretapFundUuid: FundsUUID,
	clobToken: ClobTokenId,
	numberOfSharesSelling: number
): Promise<Position | null> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		// Retrieve all positions for this share, ordered by created_at (FIFO - oldest first)
		const positions = await prismaClient.position.findMany({
			where: {
				wiretap_fund_uuid: wiretapFundUuid,
				clob_token_id: clobToken
			},
			select: {
				position_id: true,
				number_shares_held: true,
				average_cost_per_share: true,
				created_at: true
			},
			orderBy: {
				created_at: "asc"
			}
		})

		if (isNil(positions)) return null

		// Calculate total shares held
		let totalNumberOfSharesHeld = 0
		for (const position of positions) {
			totalNumberOfSharesHeld += position.number_shares_held
		}

		// Calculate FIFO total cost for the shares being sold
		let sharesRemainingToSell = numberOfSharesSelling
		let totalCostForSharesSelling = 0

		for (const position of positions) {
			if (sharesRemainingToSell <= 0) break

			const sharesToTakeFromThisPosition = Math.min(
				position.number_shares_held,
				sharesRemainingToSell
			)

			const costFromThisPosition =
				sharesToTakeFromThisPosition * position.average_cost_per_share

			totalCostForSharesSelling += costFromThisPosition
			sharesRemainingToSell -= sharesToTakeFromThisPosition
		}

		return {
			numberOfSharesHeld: totalNumberOfSharesHeld,
			totalCostOfSharesSelling: totalCostForSharesSelling
		} satisfies Position
	} catch (error) {
		console.error("Error finding position:", error)
		throw error
	}
}
