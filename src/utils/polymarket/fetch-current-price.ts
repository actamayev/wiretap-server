import axios from "axios"

interface PolymarketMidpointResponse {
	mid?: string
	price?: string
}

// TODO 12/9/25: Use https://docs.polymarket.com/api-reference/pricing/get-multiple-market-prices for multiple clob token ids
export default async function fetchPolymarketPrice(clobTokenId: ClobTokenId): Promise<number | null> {
	try {
		const midpointUrl = `https://clob.polymarket.com/midpoint?token_id=${clobTokenId}`

		const { data } = await axios.get<PolymarketMidpointResponse>(midpointUrl, {
			headers: {
				"Content-Type": "application/json"
			}
		})

		const priceString = data.mid || data.price

		if (!priceString) {
			console.error("No price data in Polymarket response")
			return null
		}

		const price = parseFloat(priceString)

		if (isNaN(price) || price < 0 || price > 1) {
			console.error(`Invalid price received: ${priceString}`)
			return null
		}

		return price
	} catch (error) {
		console.error("Failed to fetch price from Polymarket:", error)
		return null
	}
}
