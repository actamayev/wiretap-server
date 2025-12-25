/* eslint-disable @typescript-eslint/naming-convention */
export const GAMMA_BASE_URL = "https://gamma-api.polymarket.com"
export const CLOB_BASE_URL = "https://clob.polymarket.com"
export const MINIMUM_VOLUME = 100_000
export const SYNC_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
export const PORTFOLIO_SNAPSHOT_INTERVAL_MS = 60 * 1000 // 1 minute
export const CLEANUP_INTERVAL_MS = 60 * 60 * 1000
export const RESOLUTION_CHECK_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
// Batch sizes differ because condition IDs are ~66 char hex strings vs short numeric event IDs
export const EVENT_RESOLUTION_BATCH_SIZE = 200 // Event IDs are short numbers
export const MARKET_RESOLUTION_BATCH_SIZE = 20 // Condition IDs are long hex strings
