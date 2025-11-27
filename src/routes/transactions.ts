import express from "express"

import confirmWiretapBrokerageAccountIdExistsAndValidId
	from "../middleware/confirm/confirm-wiretap-brokerage-account-id-exists-and-valid-id"
import validateWiretapBrokerageAccountIdInParams from "../middleware/request-validation/validate-wiretap-brokerage-account-id-in-params"

import getAllTransactions from "../controllers/transactions/get-all-transactions"

const transactionsRoutes = express.Router()

transactionsRoutes.get(
	"/all-transactions/:wiretapBrokerageId",
	validateWiretapBrokerageAccountIdInParams,
	confirmWiretapBrokerageAccountIdExistsAndValidId,
	getAllTransactions
)

export default transactionsRoutes
