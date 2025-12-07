declare global {
	// ============================================
	// GAMMA API - Events Endpoint
	// ============================================

	interface PolymarketEvent {
		// Core identification
		id: EventUUID
		ticker: string
		slug: string
		title: string
		subtitle?: string
		description: string
		resolutionSource?: string

		// Dates
		startDate: string // ISO date
		creationDate: string // ISO date
		endDate: string // ISO date
		createdAt: string // ISO date
		updatedAt: string // ISO date
		closedTime?: string // ISO date

		// Media
		image: string
		icon: string
		featuredImage?: string

		// Status flags
		active: boolean
		closed: boolean
		archived: boolean
		new: boolean
		featured: boolean
		restricted: boolean

		// Financial metrics
		liquidity: number
		volume: number
		openInterest?: number
		liquidityAmm?: number
		liquidityClob?: number

		// Volume breakdown
		volume24hr: number
		volume1wk: number
		volume1mo: number
		volume1yr: number

		// Metadata
		category?: string
		subcategory?: string
		sortBy?: string
		competitive: number
		commentCount: number
		enableOrderBook: boolean

		// Relations
		markets: PolymarketMarket[]
		tags: PolymarketTag[]
		series?: PolymarketSeries[]

		// Template fields
		isTemplate?: boolean
		templateVariables?: string

		// Additional flags
		commentsEnabled?: boolean
		cyom?: boolean
		showAllOutcomes?: boolean
		showMarketImages?: boolean
		enableNegRisk?: boolean
		automaticallyActive?: boolean
		negRiskAugmented?: boolean
		pendingDeployment?: boolean
		deploying?: boolean
	}

	interface PolymarketMarket {
		// Core identification
		id: string
		question: string
		conditionId: string // THIS IS THE KEY FIELD - the tradeable contract ID
		slug: string
		questionID: string

		// Dates
		startDate: string // ISO date
		endDate: string // ISO date
		startDateIso?: string
		endDateIso?: string
		createdAt: string
		updatedAt: string
		acceptingOrdersTimestamp?: string

		// Market data - NOTE: These are JSON strings, not arrays!
		outcomes: string // JSON string like "[\"Yes\", \"No\"]"
		outcomePrices: string // JSON string like "[\"0.007\", \"0.993\"]"
		clobTokenIds: string // JSON string like "[\"token1\", \"token2\"]"

		// Current prices
		lastTradePrice?: number
		bestBid?: number
		bestAsk?: number
		spread?: number

		// Price changes
		oneDayPriceChange?: number
		oneWeekPriceChange?: number
		oneMonthPriceChange?: number

		// Financial metrics
		volume: string // String representation of number
		volumeNum?: number
		liquidity: string // String representation of number
		liquidityNum?: number
		liquidityAmm?: number
		liquidityClob?: number

		// Volume breakdown
		volume24hr?: number
		volume1wk?: number
		volume1mo?: number
		volume1yr?: number
		volume24hrClob?: number
		volume1wkClob?: number
		volume1moClob?: number
		volume1yrClob?: number
		volumeClob?: number

		// Order book settings
		enableOrderBook: boolean
		orderPriceMinTickSize?: number
		orderMinSize?: number
		acceptingOrders?: boolean

		// Status flags
		active: boolean
		closed: boolean
		archived?: boolean
		new?: boolean
		featured?: boolean
		restricted?: boolean
		ready?: boolean
		funded?: boolean

		// Fees
		makerBaseFee?: number
		takerBaseFee?: number

		// Resolution
		resolvedBy?: string
		umaResolutionStatuses?: string

		// Media
		image?: string
		icon?: string
		description?: string
		resolutionSource?: string

		// Additional metadata
		competitive?: number
		negRisk?: boolean
		cyom?: boolean
		automaticallyActive?: boolean
		clearBookOnStart?: boolean
		manualActivation?: boolean
		pagerDutyNotificationEnabled?: boolean
		approved?: boolean

		// Rewards
		rewardsMinSize?: number
		rewardsMaxSpread?: number

		// Market grouping
		groupItemTitle?: string
		groupItemThreshold?: string

		// Additional flags
		hasReviewedDates?: boolean
		feesEnabled?: boolean
		holdingRewardsEnabled?: boolean
		rfqEnabled?: boolean
	}

	interface PolymarketTag {
	  id: string
	  label: string
	  slug: string
	  forceShow?: boolean
	  publishedAt?: string
	  createdAt?: string
	  updatedAt?: string
	  forceHide?: boolean
	  isCarousel?: boolean
	}

	interface PolymarketSeries {
	  id: string
	  ticker: string
	  slug: string
	  title: string
	  subtitle?: string
	  seriesType?: string
	  recurrence?: string
	  description?: string
	  image?: string
	  icon?: string
	  layout?: string
	  active: boolean
	  closed: boolean
	  archived: boolean
	  new: boolean
	  featured: boolean
	  restricted: boolean
	  createdAt: string
	  updatedAt: string
	}

	// ============================================
	// Helper types for parsing
	// ============================================

	// Use these when parsing the JSON strings
	interface ParsedMarketData {
	  outcomes: string[] // Parsed from outcomes JSON string
	  outcomePrices: number[] // Parsed from outcomePrices JSON string
	  clobTokenIds: string[] // Parsed from clobTokenIds JSON string
	}

	// ============================================
	// Query parameters
	// ============================================

	interface PolymarketEventsQueryParams {
		limit?: number // Default 100, max 100
		offset?: number // For pagination

		// Filtering
		active?: boolean
		closed?: boolean
		archived?: boolean
		featured?: boolean
		cyom?: boolean

		// Volume filtering
		liquidity_min?: number
		liquidity_max?: number
		volume_min?: number
		volume_max?: number

		// Date filtering
		start_date_min?: string // ISO date-time
		start_date_max?: string // ISO date-time
		end_date_min?: string // ISO date-time
		end_date_max?: string // ISO date-time

		// Sorting (comma-separated list, use "-" prefix for descending)
		order?: string // e.g., "-volume", "start_date", "-liquidity"
		ascending?: boolean

		// ID/slug filtering
		id?: number[]
		slug?: string[]
		tag_id?: number
		exclude_tag_id?: number[]
		tag_slug?: string

		// Other options
		related_tags?: boolean
		include_chat?: boolean
		include_template?: boolean
		recurrence?: string
	}

	interface ParsedOutcome {
		clobTokenId: string
		outcome: string
		outcomeIndex: number
		currentPrice: number | null
	}
}

export {}
