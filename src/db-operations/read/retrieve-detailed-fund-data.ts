import PrismaClientClass from "../../classes/prisma-client"

// eslint-disable-next-line max-lines-per-function
export default async function retrieveDetailedFundData(fundUUID: FundsUUID): Promise<DetailedSingleFund> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const [purchaseOrders, saleOrders, portfolioSnapshots] = await prismaClient.$transaction([
			prismaClient.purchase_order.findMany({
				where: { wiretap_fund_uuid: fundUUID },
				select: {
					number_of_shares: true,
					total_cost: true,
					created_at: true,
					outcome: { select: {
						outcome: true,
						market: {
							select: {
								question: true,
								group_item_title: true,
								event: { select: { event_slug: true, image_url: true } }
							}
						}
					} }
				},
				orderBy: { created_at: "desc" }
			}),
			prismaClient.sale_order.findMany({
				where: { wiretap_fund_uuid: fundUUID },
				select: {
					number_of_shares: true,
					total_proceeds: true,
					created_at: true,
					outcome: { select: {
						outcome: true,
						market: {
							select: {
								question: true,
								group_item_title: true,
								event: { select: { event_slug: true, image_url: true } }
							}
						}
					} }
				},
				orderBy: { created_at: "desc" }
			}),
			prismaClient.portfolio_snapshot.findMany({
				where: {
					wiretap_fund_uuid: fundUUID,
					resolution_minutes: 5,
					timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
				},
				select: { timestamp: true, total_value: true },
				orderBy: { timestamp: "asc" }
			})
		])

		const purchaseOrdersTransformed: PurchaseOrder[] = purchaseOrders.map(order => ({
			outcome: order.outcome.outcome as OutcomeString,
			transactionDate: order.created_at,
			marketQuestion: order.outcome.market.question,
			groupItemTitle: order.outcome.market.group_item_title,
			polymarketSlug: order.outcome.market.event.event_slug as EventSlug,
			polymarketImageUrl: order.outcome.market.event.image_url as string,
			numberOfSharesPurchased: order.number_of_shares,
			totalCost: order.total_cost
		}))

		const saleOrdersTransformed: SaleOrder[] = saleOrders.map(order => ({
			outcome: order.outcome.outcome as OutcomeString,
			transactionDate: order.created_at,
			marketQuestion: order.outcome.market.question,
			groupItemTitle: order.outcome.market.group_item_title as string,
			polymarketSlug: order.outcome.market.event.event_slug as EventSlug,
			polymarketImageUrl: order.outcome.market.event.image_url as string,
			numberOfSharesSold: order.number_of_shares,
			totalProceeds: order.total_proceeds
		}))

		const portfolioHistory: SinglePortfolioSnapshot[] = portfolioSnapshots.map(snapshot => ({
			timestamp: snapshot.timestamp,
			portfolioValueUsd: snapshot.total_value
		}))

		return {
			fundUUID,
			transactions: {
				purchaseOrders: purchaseOrdersTransformed,
				saleOrders: saleOrdersTransformed
			},
			portfolioHistory
		}
	}
	catch (error) {
		console.error(error)
		throw error
	}
}
