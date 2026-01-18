# Jobs Directory

This directory contains background jobs that run periodically to keep the application's data synchronized and maintain portfolio tracking. All jobs are orchestrated by a central startup function.

## Structure

```
jobs/
├── start-background-jobs.ts              # Main orchestrator - initializes and schedules all jobs
├── sync-market.ts                        # Fetches latest market data from Polymarket and updates database
├── sync-market-resolution.ts             # Checks for closed markets and resolved outcomes
├── calculate-portfolio-snapshots.ts      # Records fund portfolio values at various time intervals
└── cleanup-old-snapshots.ts              # Deletes old snapshot data based on retention rules
```

## Job Orchestrator

### start-background-jobs.ts
Central hub that initializes and schedules all background jobs.

**Execution flow**:
1. Runs all jobs **immediately on startup** for initial data population
2. Starts `EventsCache` refresh timer
3. Schedules each job to run at regular intervals

**Jobs and their intervals**:

| Job | Initial Run | Interval | Offset | Purpose |
|-----|-------------|----------|--------|---------|
| `syncMarkets()` | Yes | 5 min (SYNC_INTERVAL_MS) | None | Sync market data |
| `syncMarketResolution()` | Yes | 5 min (RESOLUTION_CHECK_INTERVAL_MS) | 2.5 min | Check for resolutions |
| `calculatePortfolioSnapshots()` | Yes | 1 min (PORTFOLIO_SNAPSHOT_INTERVAL_MS) | None | Record portfolio values |
| `cleanupOldSnapshots()` | Yes | 1 hour (CLEANUP_INTERVAL_MS) | None | Delete expired snapshots |
| `EventsCache.startRefreshTimer()` | Yes | 1 min (60s) | None | Refresh cached events |

**Offset strategy**: Resolution sync is offset by 2.5 minutes to stagger load and prevent all jobs from running simultaneously.

**Error handling**: Each job wrapped in try-catch; errors logged but jobs continue running independently.

---

## Individual Jobs

### sync-market.ts
Fetches active Polymarket events and syncs all market data to the database.

**Purpose**: Keep the database in sync with current Polymarket state for price data and market listings.

**Process**:
1. Fetch all active events from Polymarket GAMMA API
2. For each event:
   - Upsert event data to database
   - For each market in the event:
     - Skip markets without `conditionId` (non-tradeable)
     - Upsert market data
     - Parse market outcomes (Yes/No from JSON string)
     - Upsert each outcome
3. Log summary: events, markets, outcomes synced, skipped count

**Error handling**:
- Individual market errors don't stop event processing
- Event errors don't stop overall sync
- All errors logged; skipped count incremented
- Graceful degradation: partial sync is better than failing completely

**Key details**:
- Markets without `conditionId` are skipped (these can't be traded)
- Outcomes are parsed from JSON strings in the market data
- Uses upsert operations (insert if new, update if exists)

---

### sync-market-resolution.ts
Checks closed markets and updates their resolution status and winning outcomes.

**Purpose**: Track market resolutions and mark winning outcomes for portfolio value calculations.

**Two-phase process**:

**Phase 1: Check Event Resolutions**
- Gets all non-closed events from database
- Fetches current event data from Polymarket API in batches
- Updates events marked as `closed: true` with closure time
- Tracks closed event count

**Phase 2: Check Market Resolutions**
- Gets all non-closed markets from database
- Fetches current market data from API in batches of `MARKET_RESOLUTION_BATCH_SIZE`
- For each closed market:
  - Updates market status to closed
  - Calls `updateWinningOutcome()` to mark winning outcome
- Includes 50ms delay between batches to avoid rate limiting
- Logs progress every 100 batches for visibility

**Winning Outcome Logic**:
- Parses `outcomePrices` JSON string (e.g., `["0.2", "0.8"]`)
- Finds outcome with price exactly `"1"` (100% - the winner)
- Gets corresponding `clobTokenId` from same index
- Resets all outcomes for market to `winning_outcome: false`
- Marks found outcome as `winning_outcome: true`
- Returns false if no winner found (market may still be resolving)

**Batching strategy**:
- Event batch size: `EVENT_RESOLUTION_BATCH_SIZE`
- Market batch size: `MARKET_RESOLUTION_BATCH_SIZE`
- 50ms delay between batches to avoid API rate limiting
- Progress logged every 100 batches

---

### calculate-portfolio-snapshots.ts
Records portfolio value snapshots at multiple time resolutions for historical tracking.

**Purpose**: Track fund portfolio value over time for analytics, charting, and performance measurement.

**Multi-resolution strategy**:
Different snapshot intervals serve different purposes:
- **1-minute**: Detailed intraday tracking
- **5-minute**: Standard time-series resolution (aligned to 5-min boundaries)
- **30-minute**: Daily price analysis
- **180-minute** (3 hours): Weekly trends
- **720-minute** (12 hours): Monthly/long-term tracking

**Resolution calculation**:
Snapshots are saved based on current time:
- 1-min: Always saved
- 5-min: When `minute % 5 === 0` (e.g., 9:35, 9:40, 9:45)
- 30-min: When `minute % 30 === 0` (e.g., 9:30, 10:00)
- 180-min: When `minute % 180 === 0` (3-hour boundaries)
- 720-min: When `minute % 720 === 0` (12-hour boundaries)

**Calculation process**:
1. Get all funds with positions
2. For each fund:
   - Get all positions (holdings in specific outcomes)
   - For each position:
     - Fetch current token price (mid-point)
     - Calculate position value: `shares × price`
   - Sum position values
   - Total portfolio = `cash balance + position values`
   - Save snapshot for each applicable resolution
3. Log success/error counts

**Performance note**: TODO 12/10/25 indicates a known inefficiency - currently fetches prices individually, should batch fetch all prices at once.

---

### cleanup-old-snapshots.ts
Deletes old portfolio snapshots based on configurable retention rules.

**Purpose**: Control database size by removing old historical data according to retention policies.

**Cleanup rules**:

| Resolution | Max Age | Rule Name |
|------------|---------|-----------|
| 1-minute | 1 hour | Keep high-frequency recent data |
| 5-minute | 1 day | Keep daily trending data |
| 30-minute | 1 week | Keep weekly patterns |
| 180-minute | 1 month | Keep monthly trends |

**Logic**:
- Calculate cutoff time for each resolution rule
- Delete snapshots older than cutoff time
- Log deletion counts per rule
- Continue even if some rules delete nothing

**Notes**:
- Note: 720-minute resolution is NOT cleaned up (provides long-term baseline)
- Cleanup runs hourly, so typically low deletion counts
- Graceful: logs if nothing deleted

---

## Job Scheduling Details

### Timing
- All intervals defined in `../utils/constants.ts`
- Resolution sync offset: Runs 2.5 minutes after market sync starts

### Error Handling Pattern
```typescript
setInterval((): void => {
  try {
    void jobFunction()  // Fire and forget
  } catch (error) {
    console.error("Error:", error)
  }
}, INTERVAL_MS)
```

Jobs run independently - one job failing doesn't affect others.

### Data Dependencies
```
Events → Markets → Outcomes
                        ↓
                   Prices (from API)
                        ↓
                   Snapshots
                        ↓
                   Cleanup (old snapshots)
```

### Database Operations
- All jobs use `PrismaClientClass.getPrismaClient()`
- Uses `upsert` for idempotent operations
- Market sync uses nested loops with error handling per entity
- Resolution sync uses batch operations for efficiency

## When Adding New Jobs

1. Create job file with default export function: `async function jobName(): Promise<void>`
2. Include error handling and logging
3. Add to `startBackgroundJobs.ts`:
   - Call immediately on startup
   - Set up interval with try-catch wrapper
4. Add interval constant to `../utils/constants.ts`
5. Update this documentation with job purpose, interval, and process

## Related Files
- `../classes/events-cache.ts` - Cache started by background jobs
- `../db-operations/` - Database operations used by all jobs
- `../utils/constants.ts` - Interval timing configuration
- `../utils/polymarket/` - API fetching utilities
- `../index.ts` - Calls `startBackgroundJobs()` on server startup
