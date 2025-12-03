import isUndefined from "lodash/isUndefined"
import { PrismaClient } from "../generated/prisma/client"
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

				// Add SSL configuration for AWS RDS
				const cleanUrl = databaseUrl.trim()
				const urlWithSSL = cleanUrl.includes("?")
					? `${cleanUrl}&sslmode=no-verify`
					: `${cleanUrl}?sslmode=no-verify`

				const adapter = new PrismaPg({
					connectionString: urlWithSSL
				})

				this.prismaClient = new PrismaClient({ adapter })
				await this.prismaClient.$connect()
			}
			return this.prismaClient
		} catch (error) {
			console.error("[Prisma] Failed to initialize:", error)
			throw error
		}
	}
}
