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

				const cleanUrl = databaseUrl.trim()

				// Only add SSL configuration for production (AWS RDS)
				const isProduction = process.env.NODE_ENV === "production"
				// eslint-disable-next-line no-nested-ternary
				const connectionString = isProduction
					? (cleanUrl.includes("?")
						? `${cleanUrl}&sslmode=no-verify`
						: `${cleanUrl}?sslmode=no-verify`)
					: cleanUrl

				const adapter = new PrismaPg({
					connectionString
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
