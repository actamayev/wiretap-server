import { Request } from "express"
import rateLimit, { ipKeyGenerator } from "express-rate-limit"

export const eventsRateLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 45, // 60 requests per minute
	message: { error: "Too many requests." },
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		console.warn(`Auth rate limit exceeded for IP: ${req.ip}`)
		res.status(429).json({
			error: "Too many authentication attempts, please try again."
		})
	}
})

export const generalRateLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 45, // 60 requests per minute
	message: { error: "Too many requests." },
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req: Request) => {
		const userId = req.userId
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return userId.toString() || ipKeyGenerator(req.ip!)
	}
})

export const authRateLimiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 minutes
	max: 20, // 20 requests per 5 minutes
	message: { error: "Too many authentication attempts, please try again later." },
	standardHeaders: true,
	legacyHeaders: false,
	skipSuccessfulRequests: false, // Count all requests
	handler: (req, res) => {
		console.warn(`Auth rate limit exceeded for IP: ${req.ip}`)
		res.status(429).json({
			error: "Too many authentication attempts, please try again."
		})
	}
})

export const tradingRateLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 100, // 100 requests per minute
	message: { error: "Trading rate limit exceeded." },
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req) => {
		const userId = req.userId
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return userId.toString() || ipKeyGenerator(req.ip!)
	},
	handler: (req, res) => {
		console.warn(`Trading rate limit exceeded for user: ${req.userId || req.ip}`)
		res.status(429).json({
			error: "Too many trading requests, please slow down."
		})
	}
})

export const strictRateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // 5 requests per 15 minutes
	message: { error: "Too many requests, please try again later." },
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		console.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.path}`)
		res.status(429).json({
			error: "Too many requests from this IP, please try again later."
		})
	}
})
