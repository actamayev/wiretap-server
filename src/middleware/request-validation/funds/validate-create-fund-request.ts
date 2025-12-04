import Joi from "joi"
import isUndefined from "lodash/isUndefined"
import { Request, Response, NextFunction } from "express"

const createFundRequestSchema = Joi.object({
	fundInformation: Joi.object({
		fundName: Joi.string().required().trim().min(3).max(100)
	}).required()
}).required().unknown(false)

export default function validateCreateFundRequest(req: Request, res: Response, next: NextFunction): void {
	try {
		const { error } = createFundRequestSchema.validate(req.body)

		if (!isUndefined(error)) {
			res.status(400).json({ validationError: error.details[0].message } satisfies ValidationErrorResponse)
			return
		}

		next()
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error: Unable to validate create fund request" } satisfies ErrorResponse)
		return
	}
}
