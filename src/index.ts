import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import { isUndefined } from "lodash"

import getEnvPath from "./utils/config/get-env-path"
import { configureAppMiddleware, corsOptions } from "./middleware/init-config"

import setupRoutes from "./utils/config/setup-routes"

process.on("unhandledRejection", (reason, promise) => {
	console.error("🚨 Unhandled Promise Rejection at:", promise, "reason:", reason)
	console.error("Stack trace:", reason instanceof Error ? reason.stack : "No stack trace available")
	// Log but don't crash - let PM2 handle restarts if needed
})

process.on("uncaughtException", (error) => {
	console.error("💥 Uncaught Exception:", error)
	// This should crash and restart
	process.exit(1)
})

dotenv.config({ path: getEnvPath() })

const app = express()
app.use(cors(corsOptions))

console.info(`🚀 Server starting - PM2 Instance: ${process.env.PM2_INSTANCE_ID || "standalone"}`)
console.info(`💾 Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`)

configureAppMiddleware(app)

setupRoutes(app)

app.use((_req, res) => {
	res.status(404).json({ error: "Route not found" })
})

if (!isUndefined(process.env.NODE_ENV))  {
	setInterval(() => {
		const usage = process.memoryUsage()

		// Add disk space monitoring
		// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
		require("child_process").exec("df -h /", (error: any, stdout: any) => {
			if (!error) {
				const diskUsage = stdout.split("\n")[1].split(/\s+/)[4]
				console.info(`📊 Memory: ${Math.round(usage.heapUsed / 1024 / 1024)}MB | Disk: ${diskUsage}`)
			}
		})
	}, 30000)
}

// Start the server
const PORT = 8080
app.listen(PORT, () => {
	console.info(`Server is listening on port ${PORT}`)
})
