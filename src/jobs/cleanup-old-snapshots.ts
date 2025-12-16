import PrismaClientClass from "../classes/prisma-client"

interface CleanupRule {
	resolution: 1 | 5 | 30 | 180
	maxAgeMs: number
	description: string
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const CLEANUP_RULES: CleanupRule[] = [
	{ resolution: 1, maxAgeMs: 60 * 60 * 1000, description: "1-min (older than 1 hour)" },
	{ resolution: 5, maxAgeMs: 24 * 60 * 60 * 1000, description: "5-min (older than 1 day)" },
	{ resolution: 30, maxAgeMs: 7 * 24 * 60 * 60 * 1000, description: "30-min (older than 1 week)" },
	{ resolution: 180, maxAgeMs: 30 * 24 * 60 * 60 * 1000, description: "180-min (older than 1 month)" }
]

export default async function cleanupOldSnapshots(): Promise<void> {
	try {
		console.info("🧹 Running snapshot cleanup...")

		const prismaClient = await PrismaClientClass.getPrismaClient()
		const now = new Date()

		let totalDeleted = 0

		for (const rule of CLEANUP_RULES) {
			const cutoffTime = new Date(now.getTime() - rule.maxAgeMs)

			const result = await prismaClient.portfolio_snapshot.deleteMany({
				where: {
					resolution_minutes: rule.resolution,
					timestamp: {
						lt: cutoffTime
					}
				}
			})

			if (result.count > 0) {
				console.info(`   Deleted ${result.count} snapshots - ${rule.description}`)
			}

			totalDeleted += result.count
		}

		if (totalDeleted > 0) {
			console.info(`✅ Cleanup complete: ${totalDeleted} total snapshots deleted`)
		} else {
			console.info("✅ Cleanup complete: No snapshots to delete")
		}
	} catch (error) {
		console.error("❌ Snapshot cleanup failed:", error)
	}
}
