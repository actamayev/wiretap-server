import PrismaClientClass from "../classes/prisma-client"
import fetchEventsByIds from "../utils/polymarket/fetch-events-by-ids"
import fetchMarketsByConditionIds from "../utils/polymarket/fetch-markets-by-condition"
import { EVENT_RESOLUTION_BATCH_SIZE, MARKET_RESOLUTION_BATCH_SIZE } from "../utils/constants"

interface ResolutionSyncResult {
	eventsChecked: number
	eventsResolved: number
	marketsChecked: number
	marketsResolved: number
	outcomesUpdated: number
}

export default async function syncMarketResolution(): Promise<void> {
	console.info("🔍 Starting market resolution sync...")

	try {
		const result: ResolutionSyncResult = {
			eventsChecked: 0,
			eventsResolved: 0,
			marketsChecked: 0,
			marketsResolved: 0,
			outcomesUpdated: 0
		}

		// Phase 1: Check and update events
		const eventResults = await checkEventResolutions()
		result.eventsChecked = eventResults.checked
		result.eventsResolved = eventResults.resolved

		// Phase 2: Check and update markets + outcomes
		const marketResults = await checkMarketResolutions()
		result.marketsChecked = marketResults.checked
		result.marketsResolved = marketResults.resolved
		result.outcomesUpdated = marketResults.outcomesUpdated

		console.info(
			"✅ Resolution sync complete: " +
			`${result.eventsResolved}/${result.eventsChecked} events resolved, ` +
			`${result.marketsResolved}/${result.marketsChecked} markets resolved, ` +
			`${result.outcomesUpdated} winning outcomes marked`
		)
	} catch (error) {
		console.error("❌ Resolution sync failed:", error)
	}
}

async function checkEventResolutions(): Promise<{ checked: number; resolved: number }> {
	const prisma = await PrismaClientClass.getPrismaClient()

	// Get all non-resolved events from DB (filter out empty event_ids)
	const activeEvents = await prisma.polymarket_event.findMany({
		where: {
			closed: false,
			event_id: {
				not: ""
			}
		},
		select: {
			event_id: true
		}
	})

	if (activeEvents.length === 0) {
		return { checked: 0, resolved: 0 }
	}

	const eventIds = activeEvents.map(e => e.event_id) as EventId[]
	let resolvedCount = 0

	console.info(`   Checking ${eventIds.length} events...`)

	// Process in batches
	for (let i = 0; i < eventIds.length; i += EVENT_RESOLUTION_BATCH_SIZE) {
		const batch = eventIds.slice(i, i + EVENT_RESOLUTION_BATCH_SIZE)
		const apiEvents = await fetchEventsByIds(batch)

		for (const apiEvent of apiEvents) {
			// Check if event is now closed
			if (apiEvent.closed) {
				await prisma.polymarket_event.update({
					where: { event_id: apiEvent.id },
					data: {
						active: apiEvent.active,
						closed: true,
						closed_time: apiEvent.closedTime ? new Date(apiEvent.closedTime) : new Date()
					}
				})
				resolvedCount++
			}
		}
	}

	return { checked: eventIds.length, resolved: resolvedCount }
}

async function checkMarketResolutions(): Promise<{ checked: number; resolved: number; outcomesUpdated: number }> {
	const prisma = await PrismaClientClass.getPrismaClient()

	// Get all non-closed markets from DB (filter out empty condition_ids)
	const activeMarkets = await prisma.polymarket_market.findMany({
		where: {
			closed: false,
			condition_id: {
				not: ""
			}
		},
		select: {
			market_id: true,
			condition_id: true
		}
	})

	if (activeMarkets.length === 0) {
		return { checked: 0, resolved: 0, outcomesUpdated: 0 }
	}

	const conditionIds = activeMarkets.map(m => m.condition_id)
	const totalBatches = Math.ceil(conditionIds.length / MARKET_RESOLUTION_BATCH_SIZE)
	let resolvedCount = 0
	let outcomesUpdated = 0

	console.info(`   Checking ${conditionIds.length} markets in ${totalBatches} batches...`)

	// Process in batches with delay to avoid rate limiting
	for (let i = 0; i < conditionIds.length; i += MARKET_RESOLUTION_BATCH_SIZE) {
		const batchNum = Math.floor(i / MARKET_RESOLUTION_BATCH_SIZE) + 1
		const batch = conditionIds.slice(i, i + MARKET_RESOLUTION_BATCH_SIZE)
		const apiMarkets = await fetchMarketsByConditionIds(batch)

		for (const apiMarket of apiMarkets) {
			// Check if market is now closed
			if (apiMarket.closed) {
				// Update market status
				await prisma.polymarket_market.update({
					where: { condition_id: apiMarket.conditionId },
					data: {
						active: apiMarket.active,
						closed: true,
						accepting_orders: false
					}
				})
				resolvedCount++

				// Check for winning outcome and update
				const winningOutcomeResult = await updateWinningOutcome(apiMarket)
				if (winningOutcomeResult) {
					outcomesUpdated++
				}
			}
		}

		// Log progress every 100 batches
		if (batchNum % 100 === 0) {
			console.info(`   Progress: ${batchNum}/${totalBatches} batches (${resolvedCount} resolved so far)`)
		}

		// Small delay between batches to avoid rate limiting (50ms)
		if (i + MARKET_RESOLUTION_BATCH_SIZE < conditionIds.length) {
			await new Promise(resolve => setTimeout(resolve, 50))
		}
	}

	return { checked: conditionIds.length, resolved: resolvedCount, outcomesUpdated }
}

async function updateWinningOutcome(apiMarket: PolymarketMarket): Promise<boolean> {
	try {
		if (!apiMarket.outcomePrices || !apiMarket.clobTokenIds) {
			return false
		}

		const outcomePrices: string[] = JSON.parse(apiMarket.outcomePrices)
		const clobTokenIds: string[] = JSON.parse(apiMarket.clobTokenIds)

		// Find the winning outcome (price exactly "1")
		const winningIndex = outcomePrices.findIndex(price => price === "1")

		if (winningIndex === -1) {
			return false
		}

		const winningTokenId = clobTokenIds[winningIndex]
		const prisma = await PrismaClientClass.getPrismaClient()

		// First, reset all outcomes for this market to not winning
		const market = await prisma.polymarket_market.findUnique({
			where: { condition_id: apiMarket.conditionId },
			select: { market_id: true }
		})

		if (!market) {
			return false
		}

		await prisma.polymarket_outcome.updateMany({
			where: { market_id: market.market_id },
			data: { winning_outcome: false }
		})

		// Then mark the winner
		await prisma.polymarket_outcome.update({
			where: { clob_token_id: winningTokenId },
			data: { winning_outcome: true }
		})

		return true
	} catch (error) {
		console.error(`Failed to update winning outcome for market ${apiMarket.conditionId}:`, error)
		return false
	}
}
