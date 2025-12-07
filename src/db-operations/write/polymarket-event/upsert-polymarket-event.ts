import PrismaClientClass from "../../../classes/prisma-client"

export default async function upsertPolymarketEvent(event: PolymarketEvent): Promise<void> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		await prismaClient.polymarket_event.upsert({
			where: { event_id: event.id },
			update: {
				title: event.title,
				description: event.description,
				active: event.active,
				closed: event.closed,
				archived: event.archived,
				category: event.category,
				start_date: event.startDate,
				end_date: event.endDate,
			},
			create: {
				event_id: event.id,
				title: event.title,
				description: event.description,
				active: event.active,
				closed: event.closed,
				archived: event.archived,
				category: event.category,
				polymarket_url: `https://polymarket.com/event/${event.slug}`,
			}
		})
	} catch (error) {
		console.error("Error upserting polymarket event:", error)
		throw error
	}
}
