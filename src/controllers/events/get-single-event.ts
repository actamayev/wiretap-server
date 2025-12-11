import { Request, Response } from "express"
import EventsCache from "../../classes/events-cache"

export default async function getSingleEvent(req: Request, res: Response): Promise<Response> {
	try {
		const { eventId } = req

		const eventsCache = EventsCache.getInstance()
		const events = await eventsCache.getEventsOrFetch()

		const event = events.find(e => e.eventId === eventId)

		if (!event) {
			return res.status(500).json({ error: "Event not found" })
		}

		return res.status(200).json({ event } satisfies SingleEventResponse)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ error: "Internal Server Error: Unable to retrieve event" })
	}
}
