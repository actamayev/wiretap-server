import axios from "axios"
import { GAMMA_BASE_URL } from "../constants"

/**
 * Fetches markets from Polymarket's Gamma API by their condition IDs.
 * The API supports passing multiple condition_ids in a single request.
 *
 * @param conditionIds - Array of market condition IDs to fetch
 * @returns Array of PolymarketMarket objects
 */
export default async function fetchMarketsByConditionIds(conditionIds: string[]): Promise<PolymarketMarket[]> {
	// Filter out any empty or invalid condition IDs
	const validConditionIds = conditionIds.filter(id => id && id.trim() !== "")

	if (validConditionIds.length === 0) {
		return []
	}

	try {
		// The Gamma API accepts condition_ids as repeated query params
		const params = new URLSearchParams()
		for (const conditionId of validConditionIds) {
			params.append("condition_ids", conditionId)
		}
		// IMPORTANT: API defaults to limit=20, must explicitly set higher
		params.append("limit", String(validConditionIds.length))

		const response = await axios.get<PolymarketMarket[]>(`${GAMMA_BASE_URL}/markets`, {
			params,
			paramsSerializer: () => params.toString()
		})

		return response.data
	} catch (error) {
		console.error("Error fetching markets by condition IDs:", error)
		throw error
	}
}
