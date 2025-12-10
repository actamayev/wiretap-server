declare global {
	interface TradeOrder {
		wiretapFundUuid: FundsUUID
		clobToken: ClobTokenId
		currentPrice: number
	}

	interface ValidatedBuyOrder extends TradeOrder {
		numberOfSharesPurchasing: number
	}

	interface ValidatedSellOrder extends TradeOrder {
		numberOfSharesSelling: number
		totalCostOfSharesSelling: number
	}
}

export {}
