import { defineConfig } from "tsup"

export default defineConfig({
	entry: ["src/index.ts"],
	outDir: "dist",
	target: "node20",
	format: ["cjs"],
	bundle: true,
	clean: true,
	sourcemap: true,
	minify: false,

	// Bundle Prisma client so it's included in the output
	noExternal: ["@prisma/client", "@prisma/adapter-pg"],

	// External: dependencies that should be installed on the server
	external: [
		"express",
		"dotenv",
		"bcrypt",
		"jsonwebtoken",
		"cookie-parser",
		"cors",
		"axios",
		"joi",
		"lodash",
		"validator",
		"resend",
		"react",
		"react-dom",
		"@react-email/components",
		"@react-email/render",
		"google-auth-library",
		"@aws-sdk/client-secrets-manager",
		// Native Node.js modules
		"crypto",
		"fs",
		"path",
		"http",
		"https",
		"net",
		"tls",
		"zlib",
		"stream",
		"util",
		"events",
	],
})
