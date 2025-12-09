import express from "express"

import { generalRateLimiter } from "../middleware/rate-limiters"
import jwtVerifyAttachUser from "../middleware/jwt/jwt-verify-attach-user"
import jwtVerifyAttachUserId from "../middleware/jwt/jwt-verify-attach-user-id"
import confirmUsernameNotTaken from "../middleware/confirm/confirm-username-not-taken"
import validateUpdateUsername from "../middleware/request-validation/personal-info/validate-update-username"
import validateUpdateChangePassword from "../middleware/request-validation/personal-info/validate-update-change-password"

import setUsername from "../controllers/personal-info/set-username"
import setNewPassword from "../controllers/personal-info/set-new-password"
import getPersonalInfo from "../controllers/personal-info/get-personal-info"

const personalInfoRoutes = express.Router()

personalInfoRoutes.get(
	"/personal-info",
	jwtVerifyAttachUser,
	generalRateLimiter,
	getPersonalInfo
)

personalInfoRoutes.post(
	"/update-username/:username",
	validateUpdateUsername,
	jwtVerifyAttachUserId,
	generalRateLimiter,
	confirmUsernameNotTaken,
	setUsername
)

personalInfoRoutes.post(
	"/change-password",
	validateUpdateChangePassword,
	jwtVerifyAttachUser,
	generalRateLimiter,
	setNewPassword
)


export default personalInfoRoutes
