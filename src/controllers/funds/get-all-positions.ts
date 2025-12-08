import { Request, Response } from "express"
import retrieveAllPositions from "../../db-operations/read/position/retrieve-all-positions"

export default async function getAllPositions(req: Request, res: Response): Promise<Response> {
	try {
		const { wiretapFundUuid } = req.params as { wiretapFundUuid: FundsUUID }

		const positions = await retrieveAllPositions(wiretapFundUuid)

		return res.status(200).json({ ...positions } satisfies SinglePosition[])
	} catch (error) {
		console.error(error)
		return res.status(500).json({ error: "Internal Server Error: Unable to retrieve user positions" })
	}
}
