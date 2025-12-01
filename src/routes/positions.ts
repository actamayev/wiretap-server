import express from "express"

import confirmWiretapBrokerageAccountIdExistsAndValidId
	from "../middleware/confirm/confirm-wiretap-brokerage-account-id-exists-and-valid-id"
import validateWiretapBrokerageAccountIdInParams from "../middleware/request-validation/validate-wiretap-brokerage-account-id-in-params"

import getAllPositions from "../controllers/positions/get-all-positions"

const positionsRoutes = express.Router()

positionsRoutes.get(
	"/all-current-positions/:wiretapBrokerageId",
	validateWiretapBrokerageAccountIdInParams,
	confirmWiretapBrokerageAccountIdExistsAndValidId,
	getAllPositions
)

export default positionsRoutes
