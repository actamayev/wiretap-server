import express from "express"

import validateDecodeEmailSubscriber from "../middleware/request-validation/internal/validate-decode-email-subscriber"
import decodeEmailSubscriber from "../controllers/internal/decode-email-subscriber"

const internalRoutes = express.Router()

internalRoutes.post("/decode-email-subscriber", validateDecodeEmailSubscriber, decodeEmailSubscriber)

export default internalRoutes
