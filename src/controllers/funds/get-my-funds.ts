import { Request, Response } from "express"
import retrieveMyFunds from "../../db-operations/read/wiretap-fund/retrieve-my-funds"

export default async function getMyFunds(req: Request, res: Response): Promise<Response> {
	try {
		const { userId } = req

		const funds = await retrieveMyFunds(userId)

		return res.status(200).json({ funds } satisfies AllMyFundsResponse)
	} catch (error) {
		console.error(error)
		return res.status(500).json({ error: "Internal Server Error: Unable to retrieve user fund data" })
	}
}
