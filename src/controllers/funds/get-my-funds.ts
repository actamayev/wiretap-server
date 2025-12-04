import { isNull } from "lodash"
import { Request, Response } from "express"
import retrieveMyFunds from "../../db-operations/read/wiretap-brokerage-account/retrieve-my-funds"
import transformRawUserFunds from "../../utils/transform/transform-raw-user-funds"

export default async function getMyFunds(req: Request, res: Response): Promise<Response> {
	try {
		const { userId } = req

		const rawUserFunds = await retrieveMyFunds(userId)
		if (isNull(rawUserFunds)) {
			return res.status(400).json({ message: "Unable to find your funds" } satisfies MessageResponse)
		}
		const funds = transformRawUserFunds(rawUserFunds)

		return res.status(200).json({ funds } satisfies AllMyFundsResponse)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ error: "Internal Server Error: Unable to retrieve user fund data" })
	}
}
