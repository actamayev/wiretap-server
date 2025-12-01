import isUndefined from "lodash/isUndefined"
import { PrismaClient } from "../generated/prisma/client"  // Note new path
import { PrismaPg } from "@prisma/adapter-pg"
import SecretsManager from "./aws/secrets-manager"

export default class PrismaClientClass {
	private static prismaClient?: PrismaClient

	private constructor() {
	}

	public static async getPrismaClient(): Promise<PrismaClient> {
		try {
			if (isUndefined(this.prismaClient)) {
				const databaseUrl = await SecretsManager.getInstance().getSecret("DATABASE_URL")

				// Create adapter first
				const adapter = new PrismaPg({
					connectionString: databaseUrl
				})

				// Pass adapter to PrismaClient
				this.prismaClient = new PrismaClient({ adapter })
			}
			return this.prismaClient
		} catch (error) {
			console.error(error)
			throw error
		}
	}
}
