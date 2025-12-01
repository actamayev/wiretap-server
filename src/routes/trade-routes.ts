import express from "express"

import confirmWiretapBrokerageAccountIdExistsAndValidId
	from "../middleware/confirm/confirm-wiretap-brokerage-account-id-exists-and-valid-id"
import validateBuyContract from "../middleware/request-validation/trade/validate-buy-contract"
import validateSellContract from "../middleware/request-validation/trade/validate-sell-contract"
import validateWiretapBrokerageAccountIdInParams from "../middleware/request-validation/validate-wiretap-brokerage-account-id-in-params"

import buyContract from "../controllers/trade/buy-contract"
import sellContract from "../controllers/trade/sell-contract"
import confirmUserHasSufficientFundsToPurchaseContracts from "../middleware/confirm/confirm-wiretap-brokerage-has-sufficient-funds"

const tradeRoutes = express.Router()

tradeRoutes.post(
	"/buy/:wiretapBrokerageAccountId",
	validateWiretapBrokerageAccountIdInParams,
	validateBuyContract,
	confirmWiretapBrokerageAccountIdExistsAndValidId,
	confirmUserHasSufficientFundsToPurchaseContracts,
	// confirm polymarket contract still active
	confirmUserHasSufficientFundsToPurchaseContracts,
	buyContract
)

tradeRoutes.post(
	"/sell/:wiretapBrokerageAccountId",
	validateWiretapBrokerageAccountIdInParams,
	validateSellContract,
	confirmWiretapBrokerageAccountIdExistsAndValidId,
	//confirm user has enough shares in the contract
	sellContract
)

export default tradeRoutes
