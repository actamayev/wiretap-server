import PrismaClientClass from "../../../classes/prisma-client"
import type { PrismaClient } from "../../../generated/prisma/client"
import type * as runtime from "@prisma/client/runtime/client"

type TransactionClient = Omit<PrismaClient, runtime.ITXClientDenyList>

interface ExecuteBuyOrderParams {
	wiretapBrokerageAccountId: number
	outcomeId: number
	numberOfContracts: number
	pricePerContract: number
}

interface ExecuteBuyOrderResult {
	purchaseId: number
	positionId: number
	newAccountBalance: number
	totalCost: number
}

/**
 * Executes a buy order within a Prisma transaction
 * 1. Decrements cash from brokerage account (with safety check)
 * 2. Creates purchase order record
 * 3. Upserts position (adds contracts, updates average cost)
 */
// eslint-disable-next-line max-lines-per-function
export default async function executeBuyOrder(params: ExecuteBuyOrderParams): Promise<ExecuteBuyOrderResult> {
	const {
		wiretapBrokerageAccountId,
		outcomeId,
		numberOfContracts,
		pricePerContract
	} = params

	const totalCost = pricePerContract * numberOfContracts

	const prismaClient = await PrismaClientClass.getPrismaClient()

	// Execute all operations in a transaction
	// eslint-disable-next-line max-lines-per-function
	const result = await prismaClient.$transaction(async (tx: TransactionClient) => {
		// ============================================
		// STEP 1: Fetch and Validate Account Balance
		// ============================================
		const account = await tx.wiretap_brokerage_account.findUnique({
			where: { wiretap_brokerage_account_id: wiretapBrokerageAccountId },
			select: {
				current_account_balance_usd: true
			}
		})

		if (!account) {
			throw new Error(`Brokerage account ${wiretapBrokerageAccountId} not found`)
		}

		const newAccountBalance = account.current_account_balance_usd - totalCost

		// Double-safety check (should already be validated by middleware)
		if (newAccountBalance < 0) {
			throw new Error(
				`Insufficient funds. Balance: $${account.current_account_balance_usd}, Required: $${totalCost}`
			)
		}

		// ============================================
		// STEP 2: Decrement Account Balance
		// ============================================
		await tx.wiretap_brokerage_account.update({
			where: { wiretap_brokerage_account_id: wiretapBrokerageAccountId },
			data: {
				current_account_balance_usd: newAccountBalance
			}
		})

		// ============================================
		// STEP 3: Create Purchase Order Record
		// ============================================
		const purchaseOrder = await tx.purchase_order.create({
			data: {
				wiretap_brokerage_account_id: wiretapBrokerageAccountId,
				outcome_id: outcomeId,
				number_of_contracts: numberOfContracts,
				price_per_contract: pricePerContract,
				total_cost: totalCost
			}
		})

		// ============================================
		// STEP 4: Upsert Position
		// ============================================
		// Fetch existing position to calculate new values
		const existingPosition = await tx.position.findUnique({
			where: {
				wiretap_brokerage_account_id_outcome_id: {
					wiretap_brokerage_account_id: wiretapBrokerageAccountId,
					outcome_id: outcomeId
				}
			},
			select: {
				number_contracts_held: true,
				total_cost: true
			}
		})

		// Calculate new values based on whether position exists
		let newTotalContracts, newTotalCost, newAverageCost

		if (existingPosition) {
			newTotalContracts = existingPosition.number_contracts_held + numberOfContracts
			newTotalCost = existingPosition.total_cost + totalCost
			newAverageCost = newTotalCost / newTotalContracts
		} else {
			newTotalContracts = numberOfContracts
			newTotalCost = totalCost
			newAverageCost = pricePerContract
		}

		// Single upsert operation
		const position = await tx.position.upsert({
			where: {
				wiretap_brokerage_account_id_outcome_id: {
					wiretap_brokerage_account_id: wiretapBrokerageAccountId,
					outcome_id: outcomeId
				}
			},
			update: {
				number_contracts_held: newTotalContracts,
				average_cost_per_contract: newAverageCost,
				total_cost: newTotalCost
			},
			create: {
				wiretap_brokerage_account_id: wiretapBrokerageAccountId,
				outcome_id: outcomeId,
				number_contracts_held: newTotalContracts,
				average_cost_per_contract: newAverageCost,
				total_cost: newTotalCost
			}
		})

		return {
			purchaseId: purchaseOrder.purchase_id,
			positionId: position.position_id,
			newAccountBalance,
			totalCost
		}
	})

	return result
}
