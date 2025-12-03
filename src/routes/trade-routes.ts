import express from "express"

import confirmWiretapBrokerageAccountIdExistsAndValidId
	from "../middleware/confirm/confirm-wiretap-brokerage-account-id-exists-and-valid-id"
import validateBuyContract from "../middleware/request-validation/trade/validate-buy-contract"
import validateSellContract from "../middleware/request-validation/trade/validate-sell-contract"
import validateWiretapBrokerageAccountIdInParams from "../middleware/request-validation/validate-wiretap-brokerage-account-id-in-params"

import buyContract from "../controllers/trade/buy-contract"
import sellContract from "../controllers/trade/sell-contract"
import confirmUserHasSufficientFundsToPurchaseContracts from "../middleware/confirm/confirm-wiretap-brokerage-has-sufficient-funds"
import validateBuyOrderAndFetchPrice from "../middleware/request-validation/trade/validate-buy-order-and-fetch-price"
import validateSellOrderAndFetchPrice from "../middleware/request-validation/trade/validate-sell-order-and-fetch-price"
import validateOutcomeValid from "../middleware/request-validation/trade/validate-outcome-valid"

const tradeRoutes = express.Router()

tradeRoutes.post(
	"/buy/:wiretapBrokerageAccountId",
	validateWiretapBrokerageAccountIdInParams,
	validateBuyContract,
	confirmWiretapBrokerageAccountIdExistsAndValidId,
	validateOutcomeValid,
	validateBuyOrderAndFetchPrice,
	confirmUserHasSufficientFundsToPurchaseContracts,
	buyContract
)

tradeRoutes.post(
	"/sell/:wiretapBrokerageAccountId",
	validateWiretapBrokerageAccountIdInParams,
	validateSellContract,
	confirmWiretapBrokerageAccountIdExistsAndValidId,
	validateOutcomeValid,
	validateSellOrderAndFetchPrice,
	sellContract
)

export default tradeRoutes
