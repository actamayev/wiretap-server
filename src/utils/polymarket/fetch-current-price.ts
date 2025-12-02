interface PolymarketMidpointResponse {
	mid?: string
	price?: string
}

export default async function fetchPolymarketPrice(clobTokenId: string): Promise<number | null> {
	try {
		const midpointUrl = `https://clob.polymarket.com/midpoint?token_id=${clobTokenId}`

		const response = await fetch(midpointUrl, {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			}
		})

		if (!response.ok) {
			console.error(`Polymarket API returned ${response.status}`)
			return null
		}

		const data = await response.json() as PolymarketMidpointResponse

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
