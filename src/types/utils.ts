declare global {
	type EmailOrUsername = "Email" | "Username"

	type SecretKeys =
		| "AWS_ACCESS_KEY_ID"
		| "AWS_SECRET_ACCESS_KEY"
		| "DATABASE_URL"
		| "JWT_KEY"
		| "GOOGLE_CLIENT_ID"
		| "GOOGLE_CLIENT_SECRET"
		| "RESEND_API_KEY"

	type SecretsObject = { [K in SecretKeys]: string }
}

export {}
