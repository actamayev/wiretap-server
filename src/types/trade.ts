declare global {
	interface TradeOrder {
		wiretapBrokerageAccountId: number
		outcomeId: number
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
