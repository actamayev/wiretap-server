import { Express } from "express"
import miscRoutes from "../../routes/misc-routes"
import tradeRoutes from "../../routes/trade-routes"
import jwtVerifyAttachUserId from "../../middleware/jwt/jwt-verify-attach-user-id"
import fundsRoutes from "../../routes/funds"
import authRoutes from "../../routes/auth-routes"
import checkHealth from "../../controllers/health-checks/check-health"
import internalRoutes from "../../routes/internal-routes"
import personalInfoRoutes from "../../routes/personal-info-routes"

export default function setupRoutes(app: Express): void {
	app.use("/auth", authRoutes)
	app.use("/internal", internalRoutes)
	app.use("/health", checkHealth)
	app.use("/misc", miscRoutes)
	app.use("/personal-info", personalInfoRoutes)
	app.use("/trade", jwtVerifyAttachUserId, tradeRoutes)
	app.use("/funds", jwtVerifyAttachUserId, fundsRoutes)
}
