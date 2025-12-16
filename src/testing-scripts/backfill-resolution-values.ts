import dotenv from "dotenv"
import PrismaClientClass from "../classes/prisma-client"

// Load environment variables
dotenv.config({ path: process.env.NODE_ENV === "production" ? ".env.production" : ".env.local" })

interface ResolutionWindow {
	resolution: number
	maxAgeMs: number | null // null = keep forever
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const RESOLUTION_WINDOWS: ResolutionWindow[] = [
	{ resolution: 1, maxAgeMs: 60 * 60 * 1000 }, // 1 hour
	{ resolution: 5, maxAgeMs: 24 * 60 * 60 * 1000 }, // 1 day
	{ resolution: 30, maxAgeMs: 7 * 24 * 60 * 60 * 1000 }, // 1 week
	{ resolution: 180, maxAgeMs: 30 * 24 * 60 * 60 * 1000 }, // 1 month
	{ resolution: 720, maxAgeMs: null } // Keep forever
]

// eslint-disable-next-line max-lines-per-function
export default async function backfillResolutionValues(): Promise<void> {
	console.info("🔄 Starting resolution backfill...")

	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		// Fetch all existing snapshots
		const snapshots = await prismaClient.portfolio_snapshot.findMany({
			orderBy: { timestamp: "asc" }
		})

		console.info(`📊 Found ${snapshots.length} snapshots to process`)

		const now = new Date()
		let updatedCount = 0
		let createdCount = 0
		let noResolutionCount = 0

		for (const snapshot of snapshots) {
			const age = now.getTime() - snapshot.timestamp.getTime()
			const minute = snapshot.timestamp.getMinutes()
			const applicableResolutions: number[] = []

			// Determine which resolutions this snapshot qualifies for
			for (const window of RESOLUTION_WINDOWS) {
				const withinTimeWindow = window.maxAgeMs === null || age <= window.maxAgeMs
				const alignsWithResolution = minute % window.resolution === 0

				if (withinTimeWindow && alignsWithResolution) {
					applicableResolutions.push(window.resolution)
				}
			}

			if (applicableResolutions.length === 0) {
				// This snapshot doesn't fit any retention window
				noResolutionCount++
				continue
			}

			// Update the existing row with the first applicable resolution
			await prismaClient.portfolio_snapshot.update({
				where: { snapshot_id: snapshot.snapshot_id },
				data: { resolution_minutes: applicableResolutions[0] }
			})
			updatedCount++

			// Create additional rows for overlapping resolutions
			for (let i = 1; i < applicableResolutions.length; i++) {
				await prismaClient.portfolio_snapshot.create({
					data: {
						wiretap_fund_uuid: snapshot.wiretap_fund_uuid,
						total_value: snapshot.total_value,
						timestamp: snapshot.timestamp,
						resolution_minutes: applicableResolutions[i]
					}
				})
				createdCount++
			}
		}

		console.info("✅ Backfill complete:")
		console.info(`   - ${updatedCount} rows updated`)
		console.info(`   - ${createdCount} new rows created for overlapping resolutions`)
		console.info(`   - ${noResolutionCount} rows need cleanup (will be handled by cleanup script)`)
	} catch (error) {
		console.error("❌ Backfill failed:", error)
		throw error
	}
}

// Run if executed directly
if (require.main === module) {
	void backfillResolutionValues()
}
