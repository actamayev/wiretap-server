/* eslint-disable max-depth */
import { isEmpty } from "lodash"
import getPositionsForFund from "../db-operations/read/position/get-positions-for-fund"
import getFundsWithPositions from "../db-operations/read/wiretap-fund/get-funds-with-positions"
import createPortfolioSnapshot from "../db-operations/write/portfolio-snapshot/create-portfolio-snapshot"
import fetchCurrentTokenPrice from "../utils/polymarket/fetch-current-token-midpoint-price"

/**
 * Determine which resolutions should be saved based on current time
 */
function getApplicableResolutions(now: Date): number[] {
	const minute = now.getMinutes()
	const resolutions: number[] = [1] // Always save 1-min resolution

	if (minute % 5 === 0) {
		resolutions.push(5)
	}
	if (minute % 30 === 0) {
		resolutions.push(30)
	}
	if (minute % 180 === 0) {
		resolutions.push(180)
	}
	if (minute % 720 === 0) {
		resolutions.push(720)
	}

	return resolutions
}

/**
 * Calculate and save portfolio snapshots for all funds with active positions
 */
export default async function calculatePortfolioSnapshots(): Promise<void> {
	try {
		console.info("📊 Calculating portfolio snapshots...")

		const funds = await getFundsWithPositions()

		if (isEmpty(funds)) return

		const now = new Date()
		const applicableResolutions = getApplicableResolutions(now)

		console.info(`📊 Found ${funds.length} funds with positions`)
		console.info(`📊 Saving resolutions: ${applicableResolutions.join(", ")} minutes`)

		let successCount = 0
		let errorCount = 0

		// TODO 12/10/25: Make more efficient by getting all prices at once
		for (const fund of funds) {
			try {
				const positions = await getPositionsForFund(fund.wiretapFundUuid)
				let totalPositionValue = 0

				for (const position of positions) {
					// Try to get price from in-memory cache first
					const midpoint = await fetchCurrentTokenPrice(position.clobTokenId) ?? 0

					const positionValue = position.numberOfSharesHeld * midpoint
					totalPositionValue += positionValue
				}

				const totalPortfolioValue = fund.currentAccountBalanceUsd + totalPositionValue

				// Save snapshot for each applicable resolution
				for (const resolution of applicableResolutions) {
					await createPortfolioSnapshot(fund.wiretapFundUuid, totalPortfolioValue, resolution, now)
				}

				successCount++
			} catch (error) {
				console.error(`Failed to calculate portfolio for fund ${fund.wiretapFundUuid}:`, error)
				errorCount++
			}
		}

		console.info(`✅ Portfolio snapshots complete: ${successCount} successful, ${errorCount} errors`)
	} catch (error) {
		console.error("❌ Failed to calculate portfolio snapshots:", error)
	}
}
