import PrismaClientClass from "../../../classes/prisma-client"

/**
 * Create a portfolio snapshot record with specified resolution
 */
export default async function createPortfolioSnapshot(
	wiretapFundUuid: FundsUUID,
	totalValue: number,
	resolutionMinutes: number,
	timestamp: Date
): Promise<void> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		await prismaClient.portfolio_snapshot.create({
			data: {
				wiretap_fund_uuid: wiretapFundUuid,
				total_value: totalValue,
				resolution_minutes: resolutionMinutes,
				timestamp
			}
		})
	} catch (error) {
		console.error("Error creating portfolio snapshot:", error)
		throw error
	}
}
