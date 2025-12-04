import express from "express"

import jwtVerifyAttachUser from "../middleware/jwt/jwt-verify-attach-user"

import getPersonalInfo from "../controllers/personal-info/get-personal-info"

const personalInfoRoutes = express.Router()

personalInfoRoutes.get(
	"/get-personal-info",
	jwtVerifyAttachUser,
	getPersonalInfo
)

export default personalInfoRoutes
