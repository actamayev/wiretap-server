import { AuthMethods } from "../generated/prisma/client"

declare global {
	interface NewLocalUserFields {
		password: HashedString
		auth_method: AuthMethods
		email: string
	}

	type HashedString = string & { __hashed: true }
}

export {}
