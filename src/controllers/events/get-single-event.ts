import { Request, Response } from "express"
import EventsCache from "../../classes/events-cache"

export default async function getSingleEvent(req: Request, res: Response): Promise<Response> {
	try {
		const { eventId } = req

		const eventMetadata = await EventsCache.getInstance().getSingleEventMetadataOrFetch(eventId)

		if (!eventMetadata) return res.status(500).json({ error: "Event not found" })

		return res.status(200).json({ event: eventMetadata } satisfies SingleEventResponse)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ error: "Internal Server Error: Unable to retrieve event" })
	}
}
