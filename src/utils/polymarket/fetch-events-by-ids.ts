import axios from "axios"
import { GAMMA_BASE_URL } from "../constants"

/**
 * Fetches events from Polymarket's Gamma API by their IDs.
 * The API supports passing multiple IDs in a single request.
 *
 * @param eventIds - Array of event IDs to fetch
 * @returns Array of PolymarketEvent objects
 */
export default async function fetchEventsByIds(eventIds: EventId[]): Promise<PolymarketEvent[]> {
	// Filter out any empty or invalid event IDs
	const validEventIds = eventIds.filter(id => id && String(id).trim() !== "")

	if (validEventIds.length === 0) {
		return []
	}

	try {
		// The Gamma API accepts id as repeated query params: ?id=123&id=456
		const params = new URLSearchParams()
		for (const id of validEventIds) {
			params.append("id", String(id))
		}
		// IMPORTANT: API defaults to limit=20, must explicitly set higher
		params.append("limit", String(validEventIds.length))

		const response = await axios.get<PolymarketEvent[]>(`${GAMMA_BASE_URL}/events`, {
			params,
			paramsSerializer: () => params.toString()
		})

		return response.data
	} catch (error) {
		console.error("Error fetching events by IDs:", error)
		throw error
	}
}
