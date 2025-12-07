import { Request, Response } from "express"
import retrieveAllPolymarketEvents from "../../db-operations/read/polymarket-event/retrieve-all-polymarket-events"

export default async function getAllEvents(req: Request, res: Response): Promise<Response> {
	try {
		const events = await retrieveAllPolymarketEvents()

		return res.status(200).json({ events } satisfies AllEventsResponse)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ error: "Internal Server Error: Unable to retrieve user positions" })
	}
}
