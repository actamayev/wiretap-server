import Joi from "joi"
import isUndefined from "lodash/isUndefined"
import { Request, Response, NextFunction } from "express"
import emailValidator from "../../joi/email-validator"
import passwordValidatorSchema from "../../joi/password-validator"

const registerInformationSchema = Joi.object({
	registerInformation: Joi.object({
		email: emailValidator.required().trim(),
		password: passwordValidatorSchema.required(),
	}).required()
}).required()

export default function validateRegister(req: Request, res: Response, next: NextFunction): void {
	try {
		const { error } = registerInformationSchema.validate(req.body)

		if (!isUndefined(error)) {
			res.status(400).json({ validationError: error.details[0].message } satisfies ValidationErrorResponse)
			return
		}

		next()
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error: Unable to Validate Registration" } satisfies ErrorResponse)
		return
	}
}
