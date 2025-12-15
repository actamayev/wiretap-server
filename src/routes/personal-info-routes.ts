import express from "express"

import { generalRateLimiter } from "../middleware/rate-limiters"
import jwtVerifyAttachUser from "../middleware/jwt/jwt-verify-attach-user"
import validateUpdateChangePassword from "../middleware/request-validation/personal-info/validate-update-change-password"

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
	"/change-password",
	validateUpdateChangePassword,
	jwtVerifyAttachUser,
	generalRateLimiter,
	setNewPassword
)


export default personalInfoRoutes
