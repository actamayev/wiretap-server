import axios from "axios"
import { GAMMA_BASE_URL, MINIMUM_VOLUME } from "../constants"

export async function fetchActiveEvents(
	params?: Partial<PolymarketEventsQueryParams>
): Promise<PolymarketEvent[]> {
	try {
		const defaultParams: PolymarketEventsQueryParams = {
			active: true,
			closed: false,
			archived: false,
			volume_min: MINIMUM_VOLUME,
			order: "-volume", // ✅ Sort by volume descending (highest first)
			limit: 100,
		}

		const response = await axios.get<PolymarketEvent[]>(`${GAMMA_BASE_URL}/events`, {
			params: { ...defaultParams, ...params }
		})

		console.log(`📥 Fetched ${response.data.length} events from Gamma API`)
		return response.data
	} catch (error) {
		console.error("Error fetching events from Gamma API:", error)
		throw error
	}
}
