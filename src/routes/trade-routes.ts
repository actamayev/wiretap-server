import express from "express"

import confirmWiretapFundIdExistsAndValidId
	from "../middleware/confirm/confirm-wiretap-fund-id-exists-and-valid-id"
import validateOutcomeValid from "../middleware/request-validation/trade/validate-outcome-valid"
import validateBuyShares from "../middleware/request-validation/trade/validate-buy-shares"
import validateSellShares from "../middleware/request-validation/trade/validate-sell-shares"
import validateBuyOrderAndFetchPrice from "../middleware/request-validation/trade/validate-buy-order-and-fetch-price"
import validateSellOrderAndFetchPrice from "../middleware/request-validation/trade/validate-sell-order-and-fetch-price"
import validateWiretapFundUuidInParams from "../middleware/request-validation/validate-wiretap-brokerage-account-id-in-params"
import confirmUserHasSufficientFundsToPurchaseShares from "../middleware/confirm/confirm-wiretap-brokerage-has-sufficient-funds"
import confirmWiretapBrokerageHasSufficientShares from "../middleware/confirm/confirm-wiretap-brokerage-has-sufficient-shares"

import buyShares from "../controllers/trade/buy-shares"
import sellShares from "../controllers/trade/sell-shares"

const tradeRoutes = express.Router()

tradeRoutes.post(
	"/buy/:wiretapFundUuid",
	validateWiretapFundUuidInParams,
	validateBuyShares,
	confirmWiretapFundIdExistsAndValidId,
	validateOutcomeValid,
	validateBuyOrderAndFetchPrice,
	confirmUserHasSufficientFundsToPurchaseShares,
	buyShares
)

tradeRoutes.post(
	"/sell/:wiretapFundUuid",
	validateWiretapFundUuidInParams,
	validateSellShares,
	confirmWiretapFundIdExistsAndValidId,
	validateOutcomeValid,
	validateSellOrderAndFetchPrice,
	confirmWiretapBrokerageHasSufficientShares,
	sellShares
)

export default tradeRoutes
