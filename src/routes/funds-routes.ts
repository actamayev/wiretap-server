import express from "express"

import confirmWiretapFundIdExistsAndValidId
	from "../middleware/confirm/confirm-wiretap-fund-id-exists-and-valid-id"
import validateCreateFundRequest from "../middleware/request-validation/funds/validate-create-fund-request"
import validateWiretapFundIdInParams from "../middleware/request-validation/validate-wiretap-brokerage-account-id-in-params"
import validatePortfolioHistoryResolution from "../middleware/request-validation/funds/validate-portfolio-history-resolution"

import createFund from "../controllers/funds/create-fund"
import getMyFunds from "../controllers/funds/get-my-funds"
import setPrimaryFund from "../controllers/funds/set-primary-fund"
import getDetailedFund from "../controllers/funds/get-detailed-fund"
import getPortfolioHistoryByResolution from "../controllers/funds/get-portfolio-history-by-resolution"

const fundsRoutes = express.Router()

fundsRoutes.get("/all-my-funds", getMyFunds)

fundsRoutes.get(
	"/detailed-fund/:wiretapFundUuid",
	validateWiretapFundIdInParams,
	confirmWiretapFundIdExistsAndValidId,
	getDetailedFund
)

fundsRoutes.post(
	"/portfolio-history-by-resolution/:wiretapFundUuid",
	validateWiretapFundIdInParams,
	validatePortfolioHistoryResolution,
	confirmWiretapFundIdExistsAndValidId,
	getPortfolioHistoryByResolution
)

fundsRoutes.post("/create-fund", validateCreateFundRequest, createFund)

fundsRoutes.post(
	"/set-primary-fund/:wiretapFundUuid",
	validateWiretapFundIdInParams,
	confirmWiretapFundIdExistsAndValidId,
	setPrimaryFund
)

export default fundsRoutes
