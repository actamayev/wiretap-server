import { isNull } from "lodash"
import PrismaClientClass from "../../../classes/prisma-client"

export default async function retrieveSingleFund(userId: number, wiretapFundUuid: FundsUUID): Promise<SingleFund | null> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const fund = await prismaClient.wiretap_fund.findUnique({
			where: {
				wiretap_fund_uuid: wiretapFundUuid
			},
			select: {
				wiretap_fund_uuid: true,
				fund_name: true,
				starting_account_balance_usd: true,
				current_account_balance_usd: true
			}
		})

		if (isNull(fund)) return null

		return {
			fundUUID: fund?.wiretap_fund_uuid as FundsUUID,
			fundName: fund?.fund_name,
			startingAccountBalanceUsd: fund?.starting_account_balance_usd,
			currentAccountBalanceUsd: fund?.current_account_balance_usd
		}
	} catch (error) {
		console.error(error)
		throw error
	}
}
