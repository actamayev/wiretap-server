export default function transformRawUserFunds(rawUserFunds: RetrievedUserFunds): SingleFund[] {
	try {
		return rawUserFunds.funds.map((fund) => ({
			fundUUID: fund.fund_uuid,
			fundName: fund.fund_name,
			startingAccountBalanceUsd: fund.starting_account_balance_usd,
			currentAccountBalanceUsd: fund.current_account_balance_usd
		}))
	} catch (error) {
		console.error(error)
		throw Error
	}
}
