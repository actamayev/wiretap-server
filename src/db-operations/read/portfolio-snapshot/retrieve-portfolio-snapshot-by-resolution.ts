import PrismaClientClass from "../../../classes/prisma-client"

interface ResolutionConfig {
	resolution: number
	maxAgeHours: number | null // null = no time limit
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const TIME_WINDOW_CONFIGS: Record<TimeWindow, ResolutionConfig> = {
	"1H": { resolution: 1, maxAgeHours: 1 },
	"1D": { resolution: 5, maxAgeHours: 24 },
	"1W": { resolution: 30, maxAgeHours: 24 * 7 },
	"1M": { resolution: 180, maxAgeHours: 24 * 30 },
	"MAX": { resolution: 720, maxAgeHours: null }
}

export default async function retrievePortfolioSnapshotByResolution(
	wiretapFundUuid: FundsUUID,
	timeWindow: TimeWindow
): Promise<SinglePortfolioSnapshot[]> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()
		const config = TIME_WINDOW_CONFIGS[timeWindow]

		const portfolioSnapshots = await prismaClient.portfolio_snapshot.findMany({
			where: {
				wiretap_fund_uuid: wiretapFundUuid,
				resolution_minutes: config.resolution,
				...(config.maxAgeHours && {
					timestamp: {
						gte: new Date(Date.now() - config.maxAgeHours * 60 * 60 * 1000)
					}
				})
			},
			select: {
				timestamp: true,
				total_value: true
			},
			orderBy: { timestamp: "asc" }
		})

		return portfolioSnapshots.map((snapshot) => ({
			timestamp: snapshot.timestamp,
			portfolioValueUsd: snapshot.total_value
		}))
	} catch (error) {
		console.error(error)
		throw error
	}
}
