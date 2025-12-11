import { AuthMethods } from "../generated/prisma/client"

declare global {
	interface NewLocalUserFields {
		username: string
		password: HashedString
		auth_method: AuthMethods
		email: string
	}

	type HashedString = string & { __hashed: true }
}

export {}
