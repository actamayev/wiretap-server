import PrismaClientClass from "../../../classes/prisma-client"

interface ExecuteBuyOrderParams {
	wiretapBrokerageAccountId: number
	outcomeId: number
	numberOfContracts: number
	pricePerContract: number
}

interface ExecuteBuyOrderResult {
	success: true
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
	const result = await prismaClient.$transaction(async (tx) => {
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

		const newBalance = account.current_account_balance_usd - totalCost

		// Double-safety check (should already be validated by middleware)
		if (newBalance < 0) {
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
				current_account_balance_usd: newBalance
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
		const existingPosition = await tx.position.findUnique({
			where: {
				wiretap_brokerage_account_id_outcome_id: {
					wiretap_brokerage_account_id: wiretapBrokerageAccountId,
					outcome_id: outcomeId
				}
			},
			select: {
				position_id: true,
				number_contracts_held: true,
				total_cost: true
			}
		})

		let position

		if (existingPosition) {
			// Update existing position: add contracts and recalculate average cost
			const newTotalContracts = existingPosition.number_contracts_held + numberOfContracts
			const newTotalCost = existingPosition.total_cost + totalCost
			const newAverageCost = newTotalCost / newTotalContracts

			position = await tx.position.update({
				where: {
					wiretap_brokerage_account_id_outcome_id: {
						wiretap_brokerage_account_id: wiretapBrokerageAccountId,
						outcome_id: outcomeId
					}
				},
				data: {
					number_contracts_held: newTotalContracts,
					average_cost_per_contract: newAverageCost,
					total_cost: newTotalCost
				}
			})
		} else {
			// Create new position
			position = await tx.position.create({
				data: {
					wiretap_brokerage_account_id: wiretapBrokerageAccountId	,
					outcome_id: outcomeId,
					number_contracts_held: numberOfContracts,
					average_cost_per_contract: pricePerContract,
					total_cost: totalCost
				}
			})
		}

		return {
			purchaseId: purchaseOrder.purchase_id,
			positionId: position.position_id,
			newAccountBalance: newBalance,
			totalCost: totalCost
		}
	})

	return {
		success: true,
		...result
	}
}
