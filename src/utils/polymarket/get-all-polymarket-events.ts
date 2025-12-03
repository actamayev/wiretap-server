import axios from "axios"

export default async function getAllPolymarketEvents(props: PolymarketEventsQueryParams): Promise<PolymarketEvent[]> {
	try {
		const { data } = await axios.get<PolymarketEvent[]>(
			"https://gamma-api.polymarket.com/events",
			{ params: { ...props, ascending: false } }
		)

		return data
	} catch (error) {
		console.error("Polymarket API Error:", error)
		return []
	}
}
