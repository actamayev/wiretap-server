import { Express } from "express"
import miscRoutes from "../../routes/misc-routes"
import tradeRoutes from "../../routes/trade-routes"
import jwtVerifyAttachUserId from "../../middleware/jwt/jwt-verify-attach-user-id"
import transactionsRoutes from "../../routes/transactions"
import positionsRoutes from "../../routes/positions"
import authRoutes from "../../routes/auth-routes"

export default function setupRoutes(app: Express): void {
	app.use("/auth", authRoutes)
	app.use("/misc", miscRoutes)
	app.use("/trade", jwtVerifyAttachUserId, tradeRoutes)
	app.use("/transactions", jwtVerifyAttachUserId, transactionsRoutes)
	app.use("/positions", jwtVerifyAttachUserId, positionsRoutes)
}
