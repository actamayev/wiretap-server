import { isNull } from "lodash"
import { Request, Response } from "express"
import transformRawUserPositions from "../../utils/transform/transform-raw-positions"
import retrieveAllPositions from "../../db-operations/read/wiretap-brokerage-account/retrieve-all-positions"

export default async function getAllPositions(req: Request, res: Response): Promise<Response> {
	try {
		const { wiretapFundUuid } = req

		const rawUserPositions = await retrieveAllPositions(wiretapFundUuid)
		if (isNull(rawUserPositions)) {
			return res.status(400).json({ message: "Unable to find your account" } satisfies MessageResponse)
		}
		const positions = transformRawUserPositions(rawUserPositions)

		return res.status(200).json({ positions } satisfies PositionsResponse)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ error: "Internal Server Error: Unable to retrieve user positions" })
	}
}
