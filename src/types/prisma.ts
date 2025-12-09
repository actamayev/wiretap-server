import type * as runtime from "@prisma/client/runtime/client"
import type { PrismaClient, credentials } from "../generated/prisma/client"

declare global {
	type ExtendedCredentials = credentials & {
		email__encrypted: DeterministicEncryptedString | null

		password: HashedString | null
	}

	type TransactionClient = Omit<PrismaClient, runtime.ITXClientDenyList>
}

export {}
