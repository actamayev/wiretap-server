declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		interface Request {
			userId: number
			user: ExtendedCredentials
			eventId: EventId

			validatedBuyOrder: ValidatedBuyOrder
			validatedSellOrder: ValidatedSellOrder
		}
	}
}

export {}
