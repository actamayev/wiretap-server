import Joi from "joi"
import isUndefined from "lodash/isUndefined"
import { Request, Response, NextFunction } from "express"

const validateSellSharesSchema = Joi.object({
	clobToken: Joi.string().required(),
	numberOfSharesSelling: Joi.number().integer().positive().required()
}).required().unknown(false)

export default function validateSellShares(req: Request, res: Response, next: NextFunction): void {
	try {
		const { error } = validateSellSharesSchema.validate(req.body)

		if (!isUndefined(error)) {
			res.status(400).json({ validationError: error.details[0].message } satisfies ValidationErrorResponse)
			return
		}

		next()
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error: Unable to validate sell shares" } satisfies ErrorResponse)
		return
	}
}
