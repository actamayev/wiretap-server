import axios from "axios"
import { GAMMA_BASE_URL, MINIMUM_VOLUME } from "../constants"

export async function fetchActiveEvents(): Promise<PolymarketEvent[]> {
	try {
		const defaultParams = {
			active: true,
			closed: false,
			archived: false,
			volume_min: MINIMUM_VOLUME,
			order: "volume",      // ✅ Just the field name
			ascending: false,     // ✅ false = descending (highest first)
			limit: 1,
		}

		const response = await axios.get<PolymarketEvent[]>(`${GAMMA_BASE_URL}/events`, {
			params: defaultParams
		})

		console.log(`📥 Fetched ${response.data.length} events from Gamma API`)
		if (response.data.length > 0) {
			console.log(`   Top event: "${response.data[0].title}" - Volume: $${response.data[0].volume?.toLocaleString()}`)
		}
		return response.data
	} catch (error) {
		console.error("Error fetching events from Gamma API:", error)
		throw error
	}
}
