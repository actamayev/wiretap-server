/* eslint-disable complexity */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable require-await */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-lines-per-function */
// We're testing if we can dynamically add a new asset to the subscription after the initial subscription is established
import WebSocket from "ws"

const WS_URL = "wss://ws-subscriptions-clob.polymarket.com/ws/market"

const TOKEN_1 = "87769991026114894163580777793845523168226980076553814689875238288185044414090"
const TOKEN_2 = "13411284055273560855537595688801764123705139415061660246624128667183605973730"

async function testDynamicSubscription(): Promise<void> {
	console.info("🧪 Testing dynamic WebSocket subscription updates...\n")

	const ws = new WebSocket(WS_URL)
	const receivedAssets = new Set<string>()

	ws.on("open", () => {
		console.info("✅ WebSocket connected")
		console.info(`📡 Initial subscription: [${TOKEN_1}]\n`)

		// Initial subscription with only TOKEN_1
		const initialSub = {
			type: "market",
			assets_ids: [TOKEN_1]
		}
		ws.send(JSON.stringify(initialSub))

		// Start ping interval
		const pingInterval = setInterval(() => {
			if (ws.readyState === WebSocket.OPEN) {
				ws.send("PING")
			}
		}, 10000)

		// After 15 seconds, try to update subscription with both tokens
		setTimeout(() => {
			console.info(`\n🔄 Sending updated subscription: [${TOKEN_1}, ${TOKEN_2}]\n`)

			const updatedSub = {
				type: "market",
				assets_ids: [TOKEN_1, TOKEN_2]
			}
			ws.send(JSON.stringify(updatedSub))
		}, 15000)

		// After 30 seconds, report results and close
		setTimeout(() => {
			clearInterval(pingInterval)

			console.info("\n" + "=".repeat(80))
			console.info("📊 TEST RESULTS")
			console.info("=".repeat(80))
			console.info("Assets that sent messages:")
			receivedAssets.forEach(asset => {
				if (asset === TOKEN_1) {
					console.info(`  ✅ ${asset} (TOKEN_1 - initially subscribed)`)
				} else if (asset === TOKEN_2) {
					console.info(`  ✅ ${asset} (TOKEN_2 - added dynamically)`)
				} else {
					console.info(`  ⚠️  ${asset} (unknown token)`)
				}
			})

			console.info("\n" + "=".repeat(80))
			if (receivedAssets.has(TOKEN_2)) {
				console.info("✅ RESULT: Dynamic subscription update WORKS!")
				console.info("   We received messages for TOKEN_2 after updating subscription")
			} else {
				console.info("❌ RESULT: Dynamic subscription update DOES NOT WORK")
				console.info("   We only received messages for TOKEN_1 (initial subscription)")
			}
			console.info("=".repeat(80) + "\n")

			ws.close()
			process.exit(0)
		}, 30000)
	})

	ws.on("message", (data: WebSocket.RawData) => {
		const messageStr = data.toString()

		// Ignore PONG responses
		if (messageStr === "PONG") {
			console.info("📩 Received PONG")
			return
		}

		// Log first 150 chars of raw message to see what we're getting
		console.info(`📩 Received: ${messageStr.substring(0, 150)}${messageStr.length > 150 ? "..." : ""}`)

		try {
			const parsed = JSON.parse(messageStr)

			// Handle arrays (initial book snapshots)
			if (Array.isArray(parsed)) {
				console.info(`   📦 Array of ${parsed.length} messages`)
				for (const message of parsed) {
					processMessage(message, receivedAssets)
				}
				return
			}

			// Handle single messages
			console.info(`   📦 Single message: ${parsed.event_type}`)
			processMessage(parsed, receivedAssets)
		} catch (error) {
			console.error("Failed to parse message:", error)
		}
	})

	ws.on("error", (error) => {
		console.error("❌ WebSocket error:", error)
		process.exit(1)
	})

	ws.on("close", () => {
		console.info("🔌 WebSocket closed")
	})
}

function processMessage(message: any, receivedAssets: Set<string>): void {
	// Extract asset_id from different message types
	let assetId: string | null = null

	if (message.asset_id) {
		assetId = message.asset_id
	} else if (message.price_changes && Array.isArray(message.price_changes)) {
		// price_change messages have asset_ids in the price_changes array
		for (const change of message.price_changes) {
			if (change.asset_id) {
				receivedAssets.add(change.asset_id)
			}
		}
		return
	}

	if (assetId) {
		// Only log the first time we see each asset
		if (!receivedAssets.has(assetId)) {
			const tokenLabel = assetId === TOKEN_1 ? "TOKEN_1" :
			                   assetId === TOKEN_2 ? "TOKEN_2" : "UNKNOWN"
			console.info(`📨 Received ${message.event_type} message for ${tokenLabel}`)
		}
		receivedAssets.add(assetId)
	}
}

// Run the test
testDynamicSubscription().catch(error => {
	console.error("Test failed:", error)
	process.exit(1)
})
