import Joi from "joi"
import isUndefined from "lodash/isUndefined"
import { Request, Response, NextFunction } from "express"

const validateBuySharesSchema = Joi.object({
	clobToken: Joi.string().required(),
	valueOfSharesPurchasing: Joi.number().integer().positive().required()
}).required().unknown(false)

export default function validateBuyShares(req: Request, res: Response, next: NextFunction): void {
	try {
		const { error } = validateBuySharesSchema.validate(req.body)

		if (!isUndefined(error)) {
			res.status(400).json({ validationError: error.details[0].message } satisfies ValidationErrorResponse)
			return
		}

		next()
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error: Unable to validate buy shares" } satisfies ErrorResponse)
		return
	}
}
