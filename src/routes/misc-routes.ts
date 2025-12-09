import express from "express"

import validateSubscribeForEmailUpdates from "../middleware/request-validation/misc/validate-subscribe-for-email-updates"

import subscribeForEmailUpdates from "../controllers/misc/subscribe-for-email-updates"
import validateUserFeedback from "../middleware/request-validation/misc/validate-user-feedback"
import addUserFeedback from "../controllers/misc/add-user-feedback"
import jwtVerifyAttachUserId from "../middleware/jwt/jwt-verify-attach-user-id"
import { strictRateLimiter, generalRateLimiter } from "../middleware/rate-limiters"

const miscRoutes = express.Router()

miscRoutes.post(
	"/subscribe-for-email-updates",
	strictRateLimiter,
	validateSubscribeForEmailUpdates,
	subscribeForEmailUpdates
)

miscRoutes.post(
	"/user-feedback",
	validateUserFeedback,
	jwtVerifyAttachUserId,
	generalRateLimiter,
	addUserFeedback
)

export default miscRoutes
