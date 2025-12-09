declare global {
	interface TradeOrder {
		wiretapFundUuid: FundsUUID
		clobToken: ClobTokenId
		currentPrice: number
	}

	interface ValidatedBuyOrder extends TradeOrder {
		numberOfContractsPurchasing: number
	}

	interface ValidatedSellOrder extends TradeOrder {
		numberOfContractsSelling: number
		totalCostOfContractsSelling: number
	}
}

export {}
