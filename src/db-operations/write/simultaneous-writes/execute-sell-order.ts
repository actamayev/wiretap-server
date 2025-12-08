import PrismaClientClass from "../../../classes/prisma-client"

interface ExecuteSellOrderParams {
	wiretapFundUuid: FundsUUID
	clobToken: ClobTokenId
	numberOfContractsSelling: number
	pricePerContract: number
	positionAverageCost: number
}

interface ExecuteSellOrderResult {
	saleId: number
	newAccountBalance: number
	totalProceeds: number
	positionClosed: boolean
	realizedPnl: number
}

/**
 * Executes a sell order within a Prisma transaction
 * 1. Increments cash in brokerage account
 * 2. Creates sale order record with realized P&L
 * 3. Updates position (reduces contracts or deletes if fully sold)
 */
// eslint-disable-next-line max-lines-per-function
export default async function executeSellOrder(params: ExecuteSellOrderParams): Promise<ExecuteSellOrderResult> {
	try {
		const {
			wiretapFundUuid,
			clobToken,
			numberOfContractsSelling,
			pricePerContract,
			positionAverageCost
		} = params

		const totalProceeds = pricePerContract * numberOfContractsSelling
		const realizedPnl = (pricePerContract - positionAverageCost) * numberOfContractsSelling

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

			if (!fund) throw new Error(`Fund ${wiretapFundUuid} not found`)

			const newAccountBalance = fund.current_account_balance_usd + totalProceeds

			// ============================================
			// STEP 2: Increment Account Balance
			// ============================================
			await tx.wiretap_fund.update({
				where: { wiretap_fund_uuid: wiretapFundUuid },
				data: {
					current_account_balance_usd: newAccountBalance
				}
			})

			// ============================================
			// STEP 3: Create Sale Order Record
			// ============================================
			const saleOrder = await tx.sale_order.create({
				data: {
					wiretap_fund_uuid: wiretapFundUuid,
					clob_token_id: clobToken,
					number_of_contracts: numberOfContractsSelling,
					price_per_contract: pricePerContract,
					total_proceeds: totalProceeds,
					realized_pnl: realizedPnl
				}
			})

			// ============================================
			// STEP 4: Update or Delete Position
			// ============================================
			const position = await tx.position.findUnique({
				where: {
					wiretap_fund_uuid_clob_token: {
						wiretap_fund_uuid: wiretapFundUuid,
						clob_token_id: clobToken
					}
				},
				select: {
					position_id: true,
					number_contracts_held: true,
					average_cost_per_contract: true
				}
			})

			if (!position) {
				throw new Error("Position not found (should have been validated by middleware)")
			}

			const remainingContracts = position.number_contracts_held - numberOfContractsSelling
			let positionClosed = false

			if (remainingContracts <= 0) {
			// Selling all contracts - delete position
				await tx.position.delete({
					where: {
						wiretap_fund_uuid_clob_token: {
							wiretap_fund_uuid: wiretapFundUuid,
							clob_token_id: clobToken
						}
					}
				})
				positionClosed = true
			} else {
			// Partial sale - update position
				const newTotalCost = position.average_cost_per_contract * remainingContracts

				await tx.position.update({
					where: {
						wiretap_fund_uuid_outcome_id: {
							wiretap_fund_uuid: wiretapFundUuid,
							clob_token_id: clobToken
						}
					},
					data: {
						number_contracts_held: remainingContracts,
						average_cost_per_contract: newTotalCost
					// average_cost_per_contract stays the same (cost basis)
					}
				})
			}

			return {
				saleId: saleOrder.sale_id,
				newAccountBalance,
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
