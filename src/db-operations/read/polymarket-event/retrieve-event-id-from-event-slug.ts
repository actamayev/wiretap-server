import PrismaClientClass from "../../../classes/prisma-client"

export default async function retrieveEventIdFromEventSlug(eventSlug: EventSlug): Promise<EventId> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const rawPolymarketEvent = await prismaClient.polymarket_event.findUniqueOrThrow({
			where: { event_slug: eventSlug },
			select: {
				event_id: true,
			}
		})

		return rawPolymarketEvent.event_id as EventId
	} catch (error) {
		console.error(error)
		throw error
	}
}
