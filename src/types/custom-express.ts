declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		interface Request {
			userId: number
			wiretapBrokerageAccountId: number
		}
	}
}

export {}
