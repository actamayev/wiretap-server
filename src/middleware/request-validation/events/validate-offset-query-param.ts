import Joi from "joi"
import isUndefined from "lodash/isUndefined"
import { Request, Response, NextFunction } from "express"

const offsetQueryParamSchema = Joi.object({
	offset: Joi.number().integer().min(0).optional()
}).unknown(true) // Allow other query params

export default function validateOffsetQueryParam(req: Request, res: Response, next: NextFunction): void {
	try {
		const { error } = offsetQueryParamSchema.validate(req.query)

		if (!isUndefined(error)) {
			res.status(400).json({ validationError: error.details[0].message } satisfies ValidationErrorResponse)
			return
		}

		next()
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error: Unable to validate offset query parameter" } satisfies ErrorResponse)
		return
	}
}
