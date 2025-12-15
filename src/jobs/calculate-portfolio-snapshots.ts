/* eslint-disable max-depth */
import { isEmpty } from "lodash"
import getPositionsForFund from "../db-operations/read/position/get-positions-for-fund"
import getFundsWithPositions from "../db-operations/read/wiretap-fund/get-funds-with-positions"
import createPortfolioSnapshot from "../db-operations/read/portfolio-snapshot/create-portfolio-snapshot"
import fetchCurrentTokenPrice from "../utils/polymarket/fetch-current-token-midpoint-price"

/**
 * Calculate and save portfolio snapshots for all funds with active positions
 */

export default async function calculatePortfolioSnapshots(): Promise<void> {
	try {
		console.info("📊 Calculating portfolio snapshots...")

		const funds = await getFundsWithPositions()

		if (isEmpty(funds)) return

		console.info(`📊 Found ${funds.length} funds with positions`)

		let successCount = 0
		let errorCount = 0

		// TODO 12/10/25: Make more efficient by getting all prices at once
		for (const fund of funds) {
			try {
				const positions = await getPositionsForFund(fund.wiretapFundUuid)
				let totalPositionValue = 0

				for (const position of positions) {
					// Try to get price from in-memory cache first
					const midpoint = await fetchCurrentTokenPrice(position.clobTokenId)

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

		console.info(`✅ Portfolio snapshots complete: ${successCount} successful, ${errorCount} errors`)
	} catch (error) {
		console.error("❌ Failed to calculate portfolio snapshots:", error)
	}
}
