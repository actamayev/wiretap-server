import dotenv from "dotenv"
import PrismaClientClass from "../classes/prisma-client"

// Load environment variables
dotenv.config({ path: process.env.NODE_ENV === "production" ? ".env.production" : ".env.local" })

// eslint-disable-next-line max-lines-per-function
export default async function cleanupLegacyData(): Promise<void> {
	console.info("🧹 Starting legacy data cleanup...")

	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const now = new Date()
		const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

		// Find snapshots that still have default resolution (1) but are older than 1 hour
		// These are snapshots that didn't qualify for any resolution during backfill
		const legacySnapshots = await prismaClient.portfolio_snapshot.findMany({
			where: {
				resolution_minutes: 1,
				timestamp: {
					lt: oneHourAgo
				}
			},
			select: {
				snapshot_id: true,
				timestamp: true,
				wiretap_fund_uuid: true
			}
		})

		console.info(`📊 Found ${legacySnapshots.length} legacy snapshots to evaluate`)

		let deletedCount = 0

		for (const snapshot of legacySnapshots) {
			const age = now.getTime() - snapshot.timestamp.getTime()
			const minute = snapshot.timestamp.getMinutes()

			// Check if this snapshot qualifies for any higher resolution
			const qualifiesFor5Min = minute % 5 === 0 && age <= 24 * 60 * 60 * 1000
			const qualifiesFor30Min = minute % 30 === 0 && age <= 7 * 24 * 60 * 60 * 1000
			const qualifiesFor180Min = minute % 180 === 0 && age <= 30 * 24 * 60 * 60 * 1000
			const qualifiesFor720Min = minute % 720 === 0

			// If it doesn't qualify for any resolution, delete it
			if (!qualifiesFor5Min && !qualifiesFor30Min && !qualifiesFor180Min && !qualifiesFor720Min) {
				await prismaClient.portfolio_snapshot.delete({
					where: { snapshot_id: snapshot.snapshot_id }
				})
				deletedCount++
			}
		}

		console.info("✅ Cleanup complete:")
		console.info(`   - ${deletedCount} legacy snapshots deleted`)
		console.info(`   - ${legacySnapshots.length - deletedCount} snapshots kept (qualified for higher resolutions)`)
	} catch (error) {
		console.error("❌ Cleanup failed:", error)
		throw error
	}
}

// Run if executed directly
if (require.main === module) {
	void cleanupLegacyData()
}
