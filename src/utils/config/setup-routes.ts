import { Express } from "express"
import miscRoutes from "../../routes/misc-routes"
import tradeRoutes from "../../routes/trade-routes"
import jwtVerifyAttachUserId from "../../middleware/jwt/jwt-verify-attach-user-id"
import fundsRoutes from "../../routes/funds-routes"
import authRoutes from "../../routes/auth-routes"
import checkHealth from "../../controllers/health-checks/check-health"
import internalRoutes from "../../routes/internal-routes"
import personalInfoRoutes from "../../routes/personal-info-routes"
import eventsRoutes from "../../routes/events-routes"
import { authRateLimiter, eventsRateLimiter, tradingRateLimiter } from "../../middleware/rate-limiters"

export default function setupRoutes(app: Express): void {
	app.use("/auth", authRateLimiter, authRoutes)

	app.use("/events", eventsRateLimiter, eventsRoutes)
	app.use("/personal-info", personalInfoRoutes)
	app.use("/trade", jwtVerifyAttachUserId, tradingRateLimiter, tradeRoutes)
	app.use("/funds", jwtVerifyAttachUserId, tradingRateLimiter, fundsRoutes)

	app.use("/internal", internalRoutes)
	app.use("/health", checkHealth)
	app.use("/misc", miscRoutes)
}
