import { Request, Response } from "express"
import retrieveSinglePolymarketEvent from "../../db-operations/read/polymarket-event/retrieve-single-polymarket-event"

export default async function getSingleEvent(req: Request, res: Response): Promise<Response> {
	try {
		const { eventId } = req

		const event = await retrieveSinglePolymarketEvent(eventId)

		return res.status(200).json({ event } satisfies SingleEventResponse)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ error: "Internal Server Error: Unable to retrieve user positions" })
	}
}
