import isNull from "lodash/isNull"
import PrismaClientClass from "../../../classes/prisma-client"

export default async function retrieveEventIdFromEventSlug(eventSlug: EventSlug): Promise<EventId | null> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const rawPolymarketEvent = await prismaClient.polymarket_event.findUnique({
			where: { event_slug: eventSlug },
			select: {
				event_id: true,
			}
		})

		if (isNull(rawPolymarketEvent)) return null

		return rawPolymarketEvent.event_id as EventId
	} catch (error) {
		console.error(error)
		throw error
	}
}
