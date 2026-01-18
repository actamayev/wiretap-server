# Polymarket Directory

This directory contains utilities for interacting with Polymarket's GAMMA and CLOB APIs.

## Structure

```
polymarket/
├── gamma-client.ts                      # Fetch events from GAMMA API
├── fetch-events-by-ids.ts               # Batch fetch specific events
├── fetch-markets-by-condition.ts        # Batch fetch markets by condition ID
├── fetch-current-token-midpoint-price.ts # Get current market prices
└── parse-market-outcomes.ts             # Parse market outcome data
```

## API Endpoints

### GAMMA API
**Base URL**: `https://gamma-api.polymarket.com`

Used for retrieving event and market metadata:
- Events: Polymarket events/markets
- Markets: Individual market definitions

### CLOB API
**Base URL**: `https://clob.polymarket.com`

Used for real-time market data:
- Midpoint prices: Current bid-ask midpoints

---

## Files

### gamma-client.ts
Fetches all active events from Polymarket sorted by volume.

**Function**: `fetchActiveEvents(): Promise<PolymarketEvent[]>`

**Returns**: Array of up to 1000 events sorted by volume (highest first)

**Fetching strategy**:
- Total events to fetch: 1000
- Max per request: 500 (API limit)
- Minimum volume filter: 100,000 USD (configurable constant)
- Sorting: By volume, descending (highest volume first)

**Batching**:
```
Request 1: offset=0, limit=500
Request 2: offset=500, limit=500
```

**Query parameters**:
```typescript
{
  active: true,              // Only active events
  closed: false,             // Exclude closed events
  archived: false,           // Exclude archived events
  volume_min: MINIMUM_VOLUME, // Min volume filter
  order: "volume",           // Sort field
  ascending: false,          // Descending (highest first)
  limit: 500,               // Max per request
  offset: 0,                // Pagination offset
}
```

**Early termination**:
- Stops if response has fewer events than requested (indicates end of list)
- Stops if total collected reaches 1000
- Trims final array to exactly 1000

**Logging**:
```
📥 Fetched 1000 events from Gamma API
   Top event: "Bitcoin to $100k by EOY" - Volume: $1,234,567,890
```

**Error handling**:
- Logs errors to console
- Throws error (fail-fast)

**Used by**:
- Background job: `syncMarkets()` for periodic market sync

---

### fetch-events-by-ids.ts
Batch fetches specific events by their IDs.

**Function**: `fetchEventsByIds(eventIds: EventId[]): Promise<PolymarketEvent[]>`

**Input**: Array of event IDs to fetch

**Returns**: Array of event objects (or empty array if no valid IDs)

**ID validation**:
- Filters out empty strings
- Filters out whitespace-only IDs
- Returns empty array if no valid IDs after filtering

**Query parameters**:
```
?id=123&id=456&limit=2
```

**Important details**:
- API defaults to `limit=20` - **must explicitly set higher**
- Sets limit to number of requested IDs to ensure all returned
- Uses `URLSearchParams` with custom serializer for repeated params

**Error handling**:
- Logs errors
- Throws error (no silent failures)

**Used by**:
- Background job: `syncMarketResolution()` to check specific event closures

---

### fetch-markets-by-condition.ts
Batch fetches specific markets by their condition IDs.

**Function**: `fetchMarketsByConditionIds(conditionIds: string[]): Promise<PolymarketMarket[]>`

**Input**: Array of condition IDs (market identifiers)

**Returns**: Array of market objects

**Condition ID format**:
- Long hex strings (~66 characters)
- Examples: `0x1234567890abcdef...`

**ID validation**:
- Filters out empty strings and whitespace
- Returns empty array if no valid IDs

**Query parameters**:
```
?condition_ids=abc123&condition_ids=def456&limit=2
```

**Important details**:
- API defaults to `limit=20` - **must explicitly set higher**
- Sets limit equal to number of condition IDs
- Uses custom `URLSearchParams` serialization for repeated params

**Batch size note**:
- Used with `MARKET_RESOLUTION_BATCH_SIZE = 20`
- Smaller batch size than event fetching (IDs are longer)
- Long hex strings cause larger URL if batched too large

**Error handling**:
- Logs errors
- Throws error

**Used by**:
- Background job: `syncMarketResolution()` to check market closures

---

### fetch-current-token-midpoint-price.ts
Fetches current market price (midpoint) for a specific outcome token.

**Function**: `fetchCurrentTokenPrice(tokenId: ClobTokenId): Promise<number | undefined>`

**Input**: CLOB token ID (outcome identifier)

**Returns**:
- Price as number (0-1) representing probability
- `undefined` if fetch fails (graceful degradation)

**Endpoint**: `https://clob.polymarket.com/midpoint?token_id={tokenId}`

**Response format**:
```json
{
  "mid": "0.75"
}
```

**Parsing**:
- Extracts `mid` field from response
- Parses as float
- Returns parsed number

**Error handling**:
- **Does NOT throw on error**
- Logs error to console
- Returns `undefined` (graceful degradation)
- Allows portfolio calculations to continue even if some prices unavailable

**Used by**:
- Background job: `calculatePortfolioSnapshots()` to value positions
- Controllers: For real-time price display

**Performance note**:
- Fetches price for each position individually
- TODO comment indicates could be optimized with batch fetch

---

### parse-market-outcomes.ts
Parses market outcome data from JSON strings to structured format.

**Function**: `parseMarketOutcomes(market: PolymarketMarket): ParsedOutcome[]`

**Input**: Market object with outcomes and token IDs

**Process**:
1. Validates market has required fields
2. Parses JSON string fields:
   - `outcomes`: JSON array of outcome names (e.g., `["Yes", "No"]`)
   - `clobTokenIds`: JSON array of token IDs
3. Zips arrays together by index
4. Returns structured outcome objects

**Input format** (from API):
```javascript
{
  outcomes: '["Yes", "No"]',           // JSON string
  clobTokenIds: '["token1", "token2"]' // JSON string
}
```

**Output format**:
```typescript
[
  {
    clobTokenId: "token1",
    outcome: "Yes",
    outcomeIndex: 0
  },
  {
    clobTokenId: "token2",
    outcome: "No",
    outcomeIndex: 1
  }
]
```

**Error handling**:
- Validates required fields exist
- Catches JSON parse errors
- Logs error with condition ID
- Throws with descriptive error message

**Used by**:
- Background job: `syncMarkets()` when creating outcomes in database

---

## Constants

All API constants defined in `../constants.ts`:

```typescript
export const GAMMA_BASE_URL = "https://gamma-api.polymarket.com"
export const CLOB_BASE_URL = "https://clob.polymarket.com"
export const MINIMUM_VOLUME = 100_000  // Min USD volume to include
export const EVENT_RESOLUTION_BATCH_SIZE = 200  // Short numeric IDs
export const MARKET_RESOLUTION_BATCH_SIZE = 20  // Long hex strings
```

---

## Batch Processing Strategy

### Event vs Market Batching

**Event IDs** (numeric, short):
- Batch size: 200
- Examples: `1`, `12345`, `999999`

**Market Condition IDs** (hex, long):
- Batch size: 20
- Examples: `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

**Why different sizes**:
- Long hex strings cause larger URLs
- Larger URLs may hit URL length limits
- Shorter numeric IDs allow larger batches
- Reduces total number of API requests

### Rate Limiting

In `syncMarketResolution()`:
```typescript
// 50ms delay between batches
await new Promise(resolve => setTimeout(resolve, 50))
```

Prevents overwhelming Polymarket API with rapid requests.

---

## API Quirks and Gotchas

### 1. Default Limit Parameter
- Both GAMMA and CLOB default to `limit=20`
- **Must explicitly set limit higher**
- Not setting limit causes incomplete results

### 2. JSON String Fields
- Market data contains JSON strings, not arrays
- Examples:
  - `outcomes: '["Yes", "No"]'`
  - `outcomePrices: '["0.25", "0.75"]'`
  - `clobTokenIds: '[...]'`
- Must `JSON.parse()` before use

### 3. Price Format
- Prices are strings in market data
- Must parse as float
- Midpoint endpoint returns decimal: `0.0` to `1.0`
- Represents probability (0 = 0%, 1 = 100%)

### 4. Repeated Query Parameters
- GAMMA API supports repeated params: `?id=1&id=2&id=3`
- Use `URLSearchParams` with custom serializer
- Don't manually construct query strings

---

## Error Handling Strategy

### Fail-Fast (throws error)
- `gamma-client.ts`: Throws on fetch failure
- `fetch-events-by-ids.ts`: Throws on API error
- `fetch-markets-by-condition.ts`: Throws on API error
- `parse-market-outcomes.ts`: Throws on parse error

### Graceful Degradation
- `fetch-current-token-midpoint-price.ts`: Returns `undefined` on error
  - Portfolio calculations continue with `undefined` prices (treated as 0)
  - Allows partial updates when API is flaky

---

## Performance Considerations

### Known Inefficiencies
- Token price fetching is individual (not batched)
- Could fetch all prices at once from CLOB
- Currently adequate but noted for optimization

### Optimization Opportunities
1. Batch fetch all prices in `calculatePortfolioSnapshots()`
2. Cache prices temporarily to avoid repeated fetches
3. Parallelize price fetches with Promise.all()

---

## When Adding New Polymarket Utilities

1. Determine which API endpoint needed (GAMMA vs CLOB)
2. Create fetch function with appropriate error handling
3. Consider batching strategy for bulk operations
4. Add URL base constant to `../constants.ts` if new endpoint
5. Document API quirks and response format
6. Update this documentation

---

## Related Files
- `../constants.ts` - API base URLs and batch sizes
- `../../jobs/sync-market.ts` - Uses gamma-client and parse-market-outcomes
- `../../jobs/sync-market-resolution.ts` - Uses fetch-events-by-ids and fetch-markets-by-condition
- `../../jobs/calculate-portfolio-snapshots.ts` - Uses fetch-current-token-midpoint-price
- `../../types/polymarket.ts` - Type definitions for API objects
