import Joi from "joi"
import isUndefined from "lodash/isUndefined"
import { Request, Response, NextFunction } from "express"

const validateBuyContractSchema = Joi.object({
	contractUUID: Joi.string().guid({ version: ["uuidv4", "uuidv5"] }).required(),
	numberContractsSelling: Joi.number().integer().positive().required()
}).required()

export default function validateSellContract(req: Request, res: Response, next: NextFunction): void {
	try {
		const { error } = validateBuyContractSchema.validate(req.body)

		if (!isUndefined(error)) {
			res.status(400).json({ validationError: error.details[0].message } satisfies ValidationErrorResponse)
			return
		}

		next()
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error: Unable to validate sell contract" } satisfies ErrorResponse)
		return
	}
}
