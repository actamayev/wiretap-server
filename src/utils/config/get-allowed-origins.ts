export default function allowedOrigins(): string[] {
	if (process.env.NODE_ENV === "production") {
		return [
			"https://wiretap.pro",
			"https://www.wiretap.pro"
		]
	}
	return [
		"http://localhost:3000"
	]
}
