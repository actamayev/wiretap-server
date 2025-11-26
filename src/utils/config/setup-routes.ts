import { Express } from "express"
import miscRoutes from "../../routes/misc-routes"

export default function setupRoutes(app: Express): void {
	app.use("/misc", miscRoutes)
}
