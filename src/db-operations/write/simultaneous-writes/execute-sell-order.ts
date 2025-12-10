import { isNull } from "lodash"
import PrismaClientClass from "../../../classes/prisma-client"
import type { PrismaClient } from "../../../generated/prisma/client"
import type * as runtime from "@prisma/client/runtime/client"

type TransactionClient = Omit<PrismaClient, runtime.ITXClientDenyList>

interface ExecuteSellOrderParams {
	wiretapFundUuid: FundsUUID
	clobToken: ClobTokenId
	numberOfSharesSelling: number
	pricePerShare: number
	totalCostOfSharesSelling: number
}

interface ExecuteSellOrderResult {
	saleId: number
	newAccountCashBalance: number
	totalProceeds: number
	positionClosed: boolean
	realizedPnl: number
}

/**
 * Executes a sell order within a Prisma transaction
 * 1. Increments cash in brokerage account
 * 2. Creates sale order record with realized P&L
 * 3. Updates position (reduces shares or deletes if fully sold)
 */
// eslint-disable-next-line max-lines-per-function
export default async function executeSellOrder(params: ExecuteSellOrderParams): Promise<ExecuteSellOrderResult> {
	try {
		const {
			wiretapFundUuid,
			clobToken,
			numberOfSharesSelling,
			pricePerShare,
			totalCostOfSharesSelling
		} = params

		const totalProceeds = pricePerShare * numberOfSharesSelling
		const realizedPnl = totalProceeds - totalCostOfSharesSelling

		const prismaClient = await PrismaClientClass.getPrismaClient()

		// Execute all operations in a transaction
		// eslint-disable-next-line max-lines-per-function
		const result = await prismaClient.$transaction(async (tx: TransactionClient) => {
		// ============================================
		// STEP 1: Fetch Current Account Balance
		// ============================================
			const fund = await tx.wiretap_fund.findUnique({
				where: { wiretap_fund_uuid: wiretapFundUuid },
				select: {
					current_account_balance_usd: true
				}
			})

			if (isNull(fund)) throw new Error(`Fund ${wiretapFundUuid} not found`)

			const newAccountCashBalance = fund.current_account_balance_usd + totalProceeds

			// ============================================
			// STEP 2: Increment Account Balance
			// ============================================
			await tx.wiretap_fund.update({
				where: { wiretap_fund_uuid: wiretapFundUuid },
				data: {
					current_account_balance_usd: newAccountCashBalance
				}
			})

			// ============================================
			// STEP 3: Create Sale Order Record
			// ============================================
			const saleOrder = await tx.sale_order.create({
				data: {
					wiretap_fund_uuid: wiretapFundUuid,
					clob_token_id: clobToken,
					number_of_shares: numberOfSharesSelling,
					price_per_share: pricePerShare,
					total_proceeds: totalProceeds,
					realized_pnl: realizedPnl
				}
			})

			// ============================================
			// STEP 4: Update or Delete Positions (FIFO)
			// ============================================
			// Get all positions ordered by created_at (FIFO - oldest first)
			const positions = await tx.position.findMany({
				where: {
					wiretap_fund_uuid: wiretapFundUuid,
					clob_token_id: clobToken
				},
				orderBy: {
					created_at: "asc"
				}
			})

			if (positions.length === 0) {
				throw new Error("Position not found (should have been validated by middleware)")
			}

			// Apply FIFO: sell from oldest positions first
			let sharesRemainingToSell = numberOfSharesSelling
			let positionClosed = false

			for (const position of positions) {
				if (sharesRemainingToSell <= 0) break

				const sharesToSellFromThisPosition = Math.min(
					position.number_shares_held,
					sharesRemainingToSell
				)

				const remainingShares = position.number_shares_held - sharesToSellFromThisPosition

				if (remainingShares <= 0) {
					// Selling all shares from this position - delete it
					await tx.position.delete({
						where: {
							position_id: position.position_id
						}
					})
					positionClosed = true
				} else {
					// Partial sale - update this position
					const newTotalCost = position.average_cost_per_share * remainingShares

					await tx.position.update({
						where: {
							position_id: position.position_id
						},
						data: {
							number_shares_held: remainingShares,
							total_cost: newTotalCost
						}
					})
				}

				sharesRemainingToSell -= sharesToSellFromThisPosition
			}

			return {
				saleId: saleOrder.sale_id,
				newAccountCashBalance,
				totalProceeds,
				realizedPnl,
				positionClosed
			}
		})
		return result
	} catch (error) {
		console.error(error)
		throw error
	}
}
