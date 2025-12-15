import PrismaClientClass from "../../../classes/prisma-client"

/**
 * Create a portfolio snapshot record
 */
export default async function createPortfolioSnapshot(wiretapFundUuid: FundsUUID, totalValue: number): Promise<void> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		await prismaClient.portfolio_snapshot.create({
			data: {
				wiretap_fund_uuid: wiretapFundUuid,
				total_value: totalValue
			}
		})
	} catch (error) {
		console.error("Error creating portfolio snapshot:", error)
		throw error
	}
}
