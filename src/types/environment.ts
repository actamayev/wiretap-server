// eslint-disable-next-line @typescript-eslint/no-namespace, @typescript-eslint/no-unused-vars
declare namespace NodeJS {
	interface ProcessEnv {
		// Encryption:
		EMAIL_ENCRYPTION_KEY: DeterministicEncryptionKeys
		RESEND_API_KEY: string

		DATABASE_URL: string
		AWS_ACCESS_KEY_ID: string
		AWS_SECRET_ACCESS_KEY: string

		NODE_ENV: "production" | undefined
	}
}
