import { Request, Response } from "express"
import EventsCache from "../../classes/events-cache"

export default async function getAllEvents(_req: Request, res: Response): Promise<Response> {
	try {
		const eventsCache = EventsCache.getInstance()
		const events = await eventsCache.getEventsOrFetch()

		return res.status(200).json({ events } satisfies AllEventsResponse)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ error: "Internal Server Error: Unable to retrieve events" })
	}
}
