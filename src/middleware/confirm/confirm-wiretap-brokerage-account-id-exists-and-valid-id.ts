import { isUndefined } from "lodash"
import { Request, Response, NextFunction } from "express"
import retrieveUserIdFromBrokerageId from "../../db-operations/read/wiretap-brokerage-account/retrieve-user-id-from-brokerage-id"

export default async function confirmWiretapFundIdExistsAndValidId(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { userId } = req
		const { wiretapFundUuid } = req.params as { wiretapFundUuid: FundsUUID }

		const foundOwnerId = await retrieveUserIdFromBrokerageId(wiretapFundUuid as FundsUUID)

		if (isUndefined(foundOwnerId)) {
			res.status(400).json({ message: "Wiretap Brokerage Account Id doesn't exist" } satisfies MessageResponse)
			return
		}

		if (userId !== foundOwnerId) {
			res.status(400).json({ message: "This brokerage account is associated with another user" } satisfies MessageResponse)
			return
		}
		next()
	} catch (error) {
		console.error(error)
		res.status(500).json({
			error: "Internal Server Error: Unable to confirm brokerage account exists and valid userId"
		} satisfies ErrorResponse)
		return
	}
}
