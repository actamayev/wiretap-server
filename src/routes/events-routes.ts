import express from "express"

import getAllEvents from "../controllers/events/get-all-events"
import getSingleEvent from "../controllers/events/get-single-event"
import validateEventIdInParams from "../middleware/request-validation/events/validate-event-id-in-params"
import validateOffsetQueryParam from "../middleware/request-validation/events/validate-offset-query-param"
import attachEventIdFromEventSlug from "../middleware/attach/attach-event-id-from-event-slug"

const eventsRoutes = express.Router()

eventsRoutes.get("/all-events", validateOffsetQueryParam, getAllEvents)
eventsRoutes.get(
	"/single-event/:eventSlug",
	validateEventIdInParams,
	attachEventIdFromEventSlug,
	getSingleEvent
)

export default eventsRoutes
