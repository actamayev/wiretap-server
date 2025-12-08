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
		positionAverageCost: number
	}
}

export {}
