import express from "express"

import subscribeForEmailUpdates from "../controllers/misc/subscribe-for-email-updates"
import validateUserFeedback from "../middleware/request-validation/misc/validate-user-feedback"
import addUserFeedback from "../controllers/misc/add-user-feedback"
import jwtVerifyAttachUserId from "../middleware/jwt/jwt-verify-attach-user-id"
import {  generalRateLimiter } from "../middleware/rate-limiters"

const miscRoutes = express.Router()

miscRoutes.post(
	"/user-feedback",
	validateUserFeedback,
	jwtVerifyAttachUserId,
	generalRateLimiter,
	addUserFeedback
)

export default miscRoutes
