import express from "express"

import validateLogin from "../middleware/request-validation/auth/validate-login"
import validateRegister from "../middleware/request-validation/auth/validate-register"
import validateGoogleLoginAuthCallback from "../middleware/request-validation/auth/validate-google-login-auth-callback"

import login from "../controllers/auth/login"
import logout from "../controllers/auth/logout"
import register from "../controllers/auth/register"
import googleLoginAuthCallback from "../controllers/auth/google-login-auth-callback"

const authRoutes = express.Router()

authRoutes.post("/login", validateLogin, login)
authRoutes.post("/logout", logout)
authRoutes.post("/register", validateRegister, register)

authRoutes.post("/google-auth/login-callback", validateGoogleLoginAuthCallback, googleLoginAuthCallback)

export default authRoutes
