import PrismaClientClass from "../../../classes/prisma-client"

/**
 * Insert multiple price snapshots into the database
 * Calculates midpoint as (best_bid + best_ask) / 2
 */
export default async function createPriceSnapshots(snapshots: PriceSnapshot[]): Promise<void> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const records = snapshots.map(snapshot => {
			// Calculate midpoint only if both bid and ask exist
			let midpoint: number | null = null
			if (snapshot.bestBid !== null && snapshot.bestAsk !== null) {
				midpoint = (snapshot.bestBid + snapshot.bestAsk) / 2
			}

			return {
				clob_token_id: snapshot.clobTokenId,
				best_bid: snapshot.bestBid,
				best_ask: snapshot.bestAsk,
				midpoint: midpoint,
				last_trade_price: snapshot.lastTradePrice,
				timestamp: new Date(snapshot.timestamp)
			}
		})

		await prismaClient.polymarket_price_history.createMany({
			data: records,
			skipDuplicates: false // We want all price records, even if timing overlaps
		})

		console.info(`✅ Inserted ${records.length} price history records`)
	} catch (error) {
		console.error("Error inserting price snapshots:", error)
		throw error
	}
}
