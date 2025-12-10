/* eslint-disable max-depth */
import { isEmpty, isNull } from "lodash"
import PriceTracker from "../classes/price-tracker"
import getPositionsForFund from "../db-operations/read/position/get-positions-for-fund"
import getFundsWithPositions from "../db-operations/read/wiretap-fund/get-funds-with-positions"
import getMostRecentPrice from "../db-operations/read/polymarket-price-history/get-most-recent-price"
import createPortfolioSnapshot from "../db-operations/read/portfolio-snapshot/create-portfolio-snapshot"

/**
 * Calculate and save portfolio snapshots for all funds with active positions
 */

export default async function calculatePortfolioSnapshots(): Promise<void> {
	try {
		console.log("📊 Calculating portfolio snapshots...")

		const funds = await getFundsWithPositions()

		if (isEmpty(funds)) return

		console.log(`📊 Found ${funds.length} funds with positions`)

		const priceTracker = PriceTracker.getInstance()
		let successCount = 0
		let errorCount = 0

		// TODO 12/10/25: Make more efficient by getting all prices at once
		for (const fund of funds) {
			try {
				const positions = await getPositionsForFund(fund.wiretapFundUuid)
				let totalPositionValue = 0

				for (const position of positions) {
					// Try to get price from in-memory cache first
					let midpoint = priceTracker.getMidpoint(position.clobTokenId)

					// Fallback to DB if not in cache
					if (midpoint === null) {
						midpoint = await getMostRecentPrice(position.clobTokenId)
					}

					// If we still don't have a price, skip this position
					if (isNull(midpoint)) continue

					const positionValue = position.numberOfSharesHeld * midpoint
					totalPositionValue += positionValue
				}

				const totalPortfolioValue = fund.currentAccountBalanceUsd + totalPositionValue

				await createPortfolioSnapshot(fund.wiretapFundUuid, totalPortfolioValue)

				successCount++
			} catch (error) {
				console.error(`Failed to calculate portfolio for fund ${fund.wiretapFundUuid}:`, error)
				errorCount++
			}
		}

		console.log(`✅ Portfolio snapshots complete: ${successCount} successful, ${errorCount} errors`)
	} catch (error) {
		console.error("❌ Failed to calculate portfolio snapshots:", error)
	}
}
