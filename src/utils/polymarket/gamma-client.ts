import axios from "axios"
import { GAMMA_BASE_URL } from "../constants"

export async function fetchActiveEvents(): Promise<PolymarketEvent[]> {
	try {
	  const response = await axios.get<PolymarketEvent[]>(`${GAMMA_BASE_URL}/events`, {
			params: {
				active: true,
				closed: false,
				archived: false,
				limit: 100
			}
		})
		return response.data
	} catch (error) {
	  console.error("Error fetching events from Gamma API:", error)
	  throw error
	}
}
