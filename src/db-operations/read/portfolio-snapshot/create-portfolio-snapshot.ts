import PrismaClientClass from "../../../classes/prisma-client"

interface PortfolioSnapshotData {
	wiretap_fund_uuid: string
	total_value: number
}

/**
 * Create a portfolio snapshot record
 */
export default async function createPortfolioSnapshot(data: PortfolioSnapshotData): Promise<void> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		await prismaClient.portfolio_snapshot.create({
			data: {
				wiretap_fund_uuid: data.wiretap_fund_uuid,
				total_value: data.total_value,
				timestamp: new Date()
			}
		})
	} catch (error) {
		console.error("Error creating portfolio snapshot:", error)
		throw error
	}
}
