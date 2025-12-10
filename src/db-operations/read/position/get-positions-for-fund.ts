import PrismaClientClass from "../../../classes/prisma-client"

interface BasicPositions {
	clobTokenId: ClobTokenId
	numberOfSharesHeld: number
}

export default async function getPositionsForFund(wiretapFundUuid: FundsUUID): Promise<BasicPositions[]> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const positions = await prismaClient.position.findMany({
			where: {
				wiretap_fund_uuid: wiretapFundUuid,
				number_shares_held: {
					gt: 0
				}
			},
			select: {
				clob_token_id: true,
				number_shares_held: true
			}
		})

		return positions.map(position => ({
			clobTokenId: position.clob_token_id as ClobTokenId,
			numberOfSharesHeld: position.number_shares_held
		}))
	} catch (error) {
		console.error("Error fetching positions for fund:", error)
		throw error
	}
}
