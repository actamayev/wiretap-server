import PrismaClientClass from "../../../classes/prisma-client"
import { position } from "../../../generated/prisma/client"

interface ExecuteBuyOrderParams {
	wiretapFundUuid: FundsUUID
	clobToken: ClobTokenId
	numberOfSharesPurchasing: number
	pricePerShare: number
}

interface ExecuteBuyOrderResult {
	purchaseId: number
	position: position
	newAccountCashBalance: number
	totalCost: number
}

/**
 * Executes a buy order within a Prisma transaction
 * 1. Decrements cash from brokerage account (with safety check)
 * 2. Creates purchase order record
 * 3. Upserts position (adds shares, updates average cost)
 */
// eslint-disable-next-line max-lines-per-function
export default async function executeBuyOrder(params: ExecuteBuyOrderParams): Promise<ExecuteBuyOrderResult> {
	try {
		const {
			wiretapFundUuid,
			clobToken,
			numberOfSharesPurchasing,
			pricePerShare
		} = params

		const totalCost = pricePerShare * numberOfSharesPurchasing

		const prismaClient = await PrismaClientClass.getPrismaClient()

		// Execute all operations in a transaction
		// eslint-disable-next-line max-lines-per-function
		const result = await prismaClient.$transaction(async (tx: TransactionClient) => {
		// ============================================
		// STEP 1: Fetch and Validate Account Balance
		// ============================================
			const fund = await tx.wiretap_fund.findUnique({
				where: { wiretap_fund_uuid: wiretapFundUuid },
				select: {
					current_account_balance_usd: true
				}
			})

			if (!fund) throw new Error(`Brokerage account ${wiretapFundUuid} not found`)

			const newAccountCashBalance = fund.current_account_balance_usd - totalCost

			// Double-safety check (should already be validated by middleware)
			if (newAccountCashBalance < 0) {
				throw new Error(
					`Insufficient funds. Balance: $${fund.current_account_balance_usd}, Required: $${totalCost}`
				)
			}

			// ============================================
			// STEP 2: Decrement Account Balance
			// ============================================
			await tx.wiretap_fund.update({
				where: { wiretap_fund_uuid: wiretapFundUuid },
				data: {
					current_account_balance_usd: newAccountCashBalance
				}
			})

			// ============================================
			// STEP 3: Create Purchase Order Record
			// ============================================
			const purchaseOrder = await tx.purchase_order.create({
				data: {
					wiretap_fund_uuid: wiretapFundUuid,
					clob_token_id: clobToken,
					number_of_shares: numberOfSharesPurchasing,
					price_per_share: pricePerShare,
					total_cost: totalCost
				}
			})

			const newPosition = await tx.position.create({
				data: {
					wiretap_fund_uuid: wiretapFundUuid,
					clob_token_id: clobToken,
					number_shares_held: numberOfSharesPurchasing,
					average_cost_per_share: pricePerShare,
					total_cost: totalCost
				}
			})

			return {
				purchaseId: purchaseOrder.purchase_id,
				position: newPosition,
				newAccountCashBalance,
				totalCost
			}
		})

		return result
	} catch (error) {
		console.error(error)
		throw error
	}
}
