import { isEmpty } from "lodash"
import PrismaClientClass from "../../../classes/prisma-client"
import retrievePrimaryFundPositions from "../position/retrieve-primary-fund-positions"

export default async function retrieveMyFunds(userId: number): Promise<SingleFund[]> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const funds = await prismaClient.wiretap_fund.findMany({
			where: {
				user_id: userId
			},
			select: {
				wiretap_fund_uuid: true,
				fund_name: true,
				starting_account_balance_usd: true,
				current_account_balance_usd: true,
				is_primary_fund: true
			}
		})

		if (isEmpty(funds)) return []

		const primaryFund = funds.find((fund) => fund.is_primary_fund)

		const transformedFunds: SingleFund[] = funds.map((fund) => ({
			fundUUID: fund.wiretap_fund_uuid as FundsUUID,
			fundName: fund.fund_name,
			startingAccountCashBalanceUsd: fund.starting_account_balance_usd,
			currentAccountCashBalanceUsd: fund.current_account_balance_usd,
			isPrimaryFund: fund.is_primary_fund
		}))

		if (primaryFund) {
			const positions = await retrievePrimaryFundPositions(primaryFund.wiretap_fund_uuid as FundsUUID)
			const primaryFundIndex = transformedFunds.findIndex((fund) => fund.isPrimaryFund)
			if (primaryFundIndex !== -1) {
				transformedFunds[primaryFundIndex].positions = positions
			}
		}

		return transformedFunds
	} catch (error) {
		console.error(error)
		throw error
	}
}
