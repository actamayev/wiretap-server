import Joi from "joi"
import isUndefined from "lodash/isUndefined"
import { Request, Response, NextFunction } from "express"
import passwordValidatorSchema from "../../joi/password-validator"
import emailValidator from "../../joi/email-validator"

const loginInformationSchema = Joi.object({
	loginInformation: Joi.object({
		email: emailValidator.required().trim(),
		password: passwordValidatorSchema.required(),
	}).required()
}).required()

export default function validateLogin (req: Request, res: Response, next: NextFunction): void {
	try {
		const { error } = loginInformationSchema.validate(req.body)

		if (!isUndefined(error)) {
			res.status(400).json({ validationError: error.details[0].message } satisfies ValidationErrorResponse)
			return
		}

		const trimmedEmail = req.body.loginInformation.email.trimEnd()
		req.body.loginInformation.email = trimmedEmail

		next()
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Internal Server Error: Unable to Validate Login" } satisfies ErrorResponse)
		return
	}
}
