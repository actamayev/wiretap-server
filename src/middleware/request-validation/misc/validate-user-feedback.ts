import Joi from "joi"
import isUndefined from "lodash/isUndefined"
import { Request, Response, NextFunction } from "express"

const userFeedbackSchema = Joi.object({
	feedback: Joi.string().required().min(1).max(1000)
}).required()

export default function validateUserFeedback(req: Request, res: Response, next: NextFunction): void {
	try {
		const { error } = userFeedbackSchema.validate(req.body)

		if (!isUndefined(error)) {
			res.status(400).json({ validationError: error.details[0].message } satisfies ValidationErrorResponse)
			return
		}

		next()
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error: Unable to Validate user feedback" } satisfies ErrorResponse)
		return
	}
}
