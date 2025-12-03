import { config } from "dotenv"
import { defineConfig } from "prisma/config"

// Load .env.local for development
config({ path: ".env.local" })

export default defineConfig({
	schema: "prisma/schema.prisma",  // Add this
	migrations: {
		path: "prisma/migrations",      // Add this
		seed: "ts-node --files src/prisma/seed.ts",
	},
	datasource: {
		url: process.env.DATABASE_URL,  // Add this if needed for migrations
	},
})
