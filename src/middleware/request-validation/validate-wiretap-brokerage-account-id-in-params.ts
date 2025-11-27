import Joi from "joi"
import isUndefined from "lodash/isUndefined"
import { Request, Response, NextFunction } from "express"

const wiretapBrokerageAccountIdInParamsSchema = Joi.object({
	wiretapBrokerageAccountId: Joi.number().integer().positive().required()
}).required().unknown(false)

export default function validateWiretapBrokerageAccountIdInParams(req: Request, res: Response, next: NextFunction): void {
	try {
		const { error } = wiretapBrokerageAccountIdInParamsSchema.validate(req.params)

		if (!isUndefined(error)) {
			res.status(400).json({ validationError: error.details[0].message } satisfies ValidationErrorResponse)
			return
		}

		next()
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error: Unable to validate brokerage account id in params" } satisfies ErrorResponse)
		return
	}
}
