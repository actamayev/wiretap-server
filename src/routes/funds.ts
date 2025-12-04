import express from "express"

import confirmWiretapFundIdExistsAndValidId
	from "../middleware/confirm/confirm-wiretap-brokerage-account-id-exists-and-valid-id"
import validateRenameFundRequest from "../middleware/request-validation/funds/validate-rename-fund"
import validateCreateFundRequest from "../middleware/request-validation/funds/validate-create-fund-request"
import validateWiretapFundIdInParams from "../middleware/request-validation/validate-wiretap-brokerage-account-id-in-params"

import renameFund from "../controllers/funds/rename-fund"
import createFund from "../controllers/funds/create-fund"
import getMyFunds from "../controllers/funds/get-my-funds"
import getAllPositions from "../controllers/funds/get-all-positions"
import getAllTransactions from "../controllers/funds/get-all-transactions"

const fundsRoutes = express.Router()

fundsRoutes.get("/my-funds", getMyFunds)

fundsRoutes.post("/create-fund", validateCreateFundRequest, createFund)

fundsRoutes.post("/rename-fund/:wiretapFundId",
	validateWiretapFundIdInParams,
	validateRenameFundRequest,
	confirmWiretapFundIdExistsAndValidId,
	renameFund,
)

fundsRoutes.get(
	"/all-current-positions/:wiretapFundId",
	validateWiretapFundIdInParams,
	confirmWiretapFundIdExistsAndValidId,
	getAllPositions
)

fundsRoutes.get(
	"/all-fund-transactions/:wiretapFundId",
	validateWiretapFundIdInParams,
	confirmWiretapFundIdExistsAndValidId,
	getAllTransactions
)

export default fundsRoutes
