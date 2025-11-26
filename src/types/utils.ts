declare global {
	type DeterministicEncryptionKeys =
		"EMAIL_ENCRYPTION_KEY"

	type EncryptionKeys = DeterministicEncryptionKeys
	// Non-deterministic keys aren't searchable (encrypting the same string yields different results| NonDeterministicEncryptionKeys

	type SecretKeys =
		| EncryptionKeys
		| "AWS_ACCESS_KEY_ID"
		| "AWS_SECRET_ACCESS_KEY"
		| "DATABASE_URL"

	type SecretsObject = { [K in SecretKeys]: string }
}

export {}
