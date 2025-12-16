import { Request, Response } from "express"
import EventsCache from "../../classes/events-cache"

// eslint-disable-next-line @typescript-eslint/naming-convention
const EVENTS_PER_PAGE = 20

export default async function getAllEvents(req: Request, res: Response): Promise<Response> {
	try {
		const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0

		const allEvents = await EventsCache.getInstance().getEventsMetadataOrFetch()

		const paginatedEvents = allEvents.slice(offset, offset + EVENTS_PER_PAGE)

		return res.status(200).json({ events: paginatedEvents } satisfies AllEventsResponse)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ error: "Internal Server Error: Unable to retrieve events" })
	}
}
