import Joi from "joi"
import isUndefined from "lodash/isUndefined"
import { Request, Response, NextFunction } from "express"

const setPrimaryFundRequestSchema = Joi.object({
	needsPositions: Joi.boolean().required()
}).required().unknown(false)

export default function validateSetPrimaryFundRequest(req: Request, res: Response, next: NextFunction): void {
	try {
		const { error } = setPrimaryFundRequestSchema.validate(req.body)

		if (!isUndefined(error)) {
			res.status(400).json({ validationError: error.details[0].message } satisfies ValidationErrorResponse)
			return
		}

		next()
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error: Unable to validate set primary fund request" } satisfies ErrorResponse)
		return
	}
}
