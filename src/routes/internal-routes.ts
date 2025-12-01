import express from "express"

import validateDecodeEmailSubscriber from "../middleware/request-validation/internal/validate-decode-email-subscriber"
import validateSubscribeForEmailUpdates from "../middleware/request-validation/misc/validate-subscribe-for-email-updates"

import sendTestEmail from "../controllers/internal/send-test-email"
import decodeEmailSubscriber from "../controllers/internal/decode-email-subscriber"

const internalRoutes = express.Router()

internalRoutes.post("/decode-email-subscriber", validateDecodeEmailSubscriber, decodeEmailSubscriber)

internalRoutes.post("/send-test-email", validateSubscribeForEmailUpdates, sendTestEmail)

export default internalRoutes
