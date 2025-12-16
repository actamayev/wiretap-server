import Joi from "joi"
import isUndefined from "lodash/isUndefined"
import { Request, Response, NextFunction } from "express"

const portfolioHistoryTimeWindowSchema = Joi.object({
	timeWindow: Joi.string().required().valid("1H", "1D", "1W", "1M", "MAX")
}).required().unknown(false)

export default function validatePortfolioHistoryResolution(req: Request, res: Response, next: NextFunction): void {
	try {
		const { error } = portfolioHistoryTimeWindowSchema.validate(req.body)

		if (!isUndefined(error)) {
			res.status(400).json({ validationError: error.details[0].message } satisfies ValidationErrorResponse)
			return
		}

		next()
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error: Unable to validate portfolio history resolution" } satisfies ErrorResponse)
		return
	}
}
