import { Request, Response, NextFunction } from "express"
import retrieveEventIdFromEventSlug from "../../db-operations/read/polymarket-event/retrieve-event-id-from-event-slug"

export default async function attachEventIdFromEventSlug(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { eventSlug } = req.params as { eventSlug: EventSlug }

		const eventId = await retrieveEventIdFromEventSlug(eventSlug)

		req.eventId = eventId

		next()
	} catch (error) {
		console.error(error)
		res.status(500).json({
			error: "Internal Server Error: Unable to confirm if this username is already taken"
		} satisfies ErrorResponse)
		return
	}
}
