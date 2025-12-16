import axios from "axios"
import { GAMMA_BASE_URL, MINIMUM_VOLUME } from "../constants"

const totalEventsToFetch = 1000 // Total number of events to retrieve
const maxEventsPerRequest = 500 // API maxes out at 500 events per request

// eslint-disable-next-line max-lines-per-function
export default async function fetchActiveEvents(): Promise<PolymarketEvent[]> {
	try {
		const allEvents: PolymarketEvent[] = []
		const limit = maxEventsPerRequest
		const totalRequests = Math.ceil(totalEventsToFetch / limit)

		for (let i = 0; i < totalRequests; i++) {
			const offset = i * limit
			const remainingEvents = totalEventsToFetch - allEvents.length
			const currentLimit = Math.min(limit, remainingEvents)

			const defaultParams: PolymarketEventsQueryParams = {
				active: true,
				closed: false,
				archived: false,
				volume_min: MINIMUM_VOLUME,
				order: "volume",      // ✅ Just the field name
				ascending: false,     // ✅ false = descending (highest first)
				limit: currentLimit,
				offset: offset,
			}

			const response = await axios.get<PolymarketEvent[]>(`${GAMMA_BASE_URL}/events`, {
				params: defaultParams
			})

			allEvents.push(...response.data)

			// If we got fewer events than requested, we've reached the end
			if (response.data.length < currentLimit) {
				break
			}

			// If we've fetched enough events, stop
			if (allEvents.length >= totalEventsToFetch) {
				break
			}
		}

		// Trim to exact amount if we fetched more
		const finalEvents = allEvents.slice(0, totalEventsToFetch)

		console.info(`📥 Fetched ${finalEvents.length} events from Gamma API`)
		if (finalEvents.length > 0) {
			console.info(`   Top event: "${finalEvents[0].title}" - Volume: $${finalEvents[0].volume.toLocaleString()}`)
		}
		return finalEvents
	} catch (error) {
		console.error("Error fetching events from Gamma API:", error)
		throw error
	}
}
