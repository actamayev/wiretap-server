import express from "express"

import confirmWiretapFundIdExistsAndValidId
	from "../middleware/confirm/confirm-wiretap-fund-id-exists-and-valid-id"
import validateRenameFundRequest from "../middleware/request-validation/funds/validate-rename-fund"
import validateCreateFundRequest from "../middleware/request-validation/funds/validate-create-fund-request"
import validateWiretapFundIdInParams from "../middleware/request-validation/validate-wiretap-brokerage-account-id-in-params"

import renameFund from "../controllers/funds/rename-fund"
import createFund from "../controllers/funds/create-fund"
import getMyFunds from "../controllers/funds/get-my-funds"
import setPrimaryFund from "../controllers/funds/set-primary-fund"

const fundsRoutes = express.Router()

fundsRoutes.get("/all-my-funds", getMyFunds)

fundsRoutes.post("/create-fund", validateCreateFundRequest, createFund)

fundsRoutes.post("/rename-fund/:wiretapFundUuid",
	validateWiretapFundIdInParams,
	validateRenameFundRequest,
	confirmWiretapFundIdExistsAndValidId,
	renameFund
)

fundsRoutes.post(
	"/set-primary-fund/:wiretapFundUuid",
	validateWiretapFundIdInParams,
	confirmWiretapFundIdExistsAndValidId,
	setPrimaryFund
)

export default fundsRoutes
