import { AuthMethods } from "../generated/prisma/client"

declare global {
	interface NewLocalUserFields {
		username: string
		password: HashedString
		auth_method: AuthMethods
		email__encrypted: DeterministicEncryptedString
	}

	type DeterministicEncryptedString = string & { __type: "DeterministicEncryptedString" }
	type NonDeterministicEncryptedString = string & { __type: "NonDeterministicEncryptedString" }

	type HashedString = string & { __hashed: true }
}

export {}
