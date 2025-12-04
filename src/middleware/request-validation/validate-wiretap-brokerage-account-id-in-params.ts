import Joi from "joi"
import isUndefined from "lodash/isUndefined"
import { Request, Response, NextFunction } from "express"

const wiretapFundIdInParamsSchema = Joi.object({
	wiretapFundId: Joi.string().guid({ version: ["uuidv4", "uuidv5"] }).required()
}).required().unknown(false)

export default function validateWiretapFundIdInParams(req: Request, res: Response, next: NextFunction): void {
	try {
		const { error } = wiretapFundIdInParamsSchema.validate(req.params)

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
