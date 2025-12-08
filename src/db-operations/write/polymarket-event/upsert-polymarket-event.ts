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
				start_date: event.startDate,
				end_date: event.endDate,
				image_url: event.image,
				icon_url: event.icon,
				total_volume: event.volume,
			},
			create: {
				event_id: event.id,
				event_slug: event.slug,
				title: event.title,
				description: event.description,
				active: event.active,
				closed: event.closed,
				archived: event.archived,
				polymarket_url: `https://polymarket.com/event/${event.slug}`,
				image_url: event.image,
				icon_url: event.icon,
				total_volume: event.volume,
			}
		})
	} catch (error) {
		console.error("Error upserting polymarket event:", error)
		throw error
	}
}
