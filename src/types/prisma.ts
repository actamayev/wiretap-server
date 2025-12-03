import { credentials } from "../generated/prisma/client"

declare global {
	type ExtendedCredentials = credentials & {
		email__encrypted: DeterministicEncryptedString | null

		password: HashedString | null
	}
}

export {}
