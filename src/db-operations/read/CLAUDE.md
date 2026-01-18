# DB Operations: Read Directory

This directory contains all read-only database operations using Prisma ORM. Operations are organized by domain/feature for easy navigation and maintenance.

## Structure

```
read/
├── credentials/                 # User authentication credentials queries
│   └── retrieve-user-id-by-email.ts
├── does-x-exist/               # Existence checks (user, fund, position, etc.)
├── email-update-subscriber/    # Email subscription status queries
├── find/                       # Find operations (user, outcome, position)
│   ├── find-user.ts
│   ├── find-polymarket-outcome.ts
│   └── find-position.ts
├── polymarket-event/           # Event data queries (all events, by ID)
├── polymarket-outcome/         # Outcome data queries
├── portfolio-snapshot/         # Historical portfolio value queries
├── position/                   # Fund position/holdings queries
├── wiretap-fund/              # Fund data queries
│   ├── get-funds-with-positions.ts
│   ├── retrieve-my-funds.ts
│   ├── retrieve-current-account-balance.ts
│   └── ...
└── retrieve-detailed-fund-data.ts    # Complex aggregated fund details
```

## Design Principles

### 1. Single Responsibility
Each file contains related read operations for a specific domain:
- `credentials/` - User login data
- `wiretap-fund/` - Fund/portfolio data
- `position/` - Holdings data
- `polymarket-event/` - Market event data

### 2. Consistent Patterns
All read operations follow the pattern:

```typescript
export default async function operationName(params): Promise<ReturnType> {
  try {
    const prismaClient = await PrismaClientClass.getPrismaClient()
    const data = await prismaClient.table.method(queryOptions)
    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}
```

### 3. Error Handling
- All errors logged to console
- All errors thrown (fail-fast, never silent)
- Caller decides how to handle

### 4. Type Safety
- Branded types for domain entities (FundsUUID, EventId, ClobTokenId)
- Return types clearly documented
- Cast types where Prisma returns generic types

---

## Common Operation Patterns

### Retrieve by ID
```typescript
async function retrieveUserIdByEmail(email: string): Promise<number | null | undefined> {
  const user = await prismaClient.credentials.findFirst({
    where: { email },
    select: { user_id: true, is_active: true }
  })
  return isNull(user) ? null : user.user_id
}
```

**Key points**:
- Returns `null` if not found
- Returns `undefined` for special cases (inactive)
- Minimal field selection for performance
- Specific field names (not whole objects)

### Find with Status Check
```typescript
export async function findUserById(userId: number): Promise<ExtendedCredentials | null> {
  const user = await prismaClient.credentials.findUnique({
    where: { user_id: userId, is_active: true }  // Status check in query
  })
  return isNull(user) ? null : (user as ExtendedCredentials)
}
```

**Key points**:
- Status checks in WHERE clause (database-level filtering)
- Return full objects when needed by callers
- Case-insensitive email search where needed

### Collection Queries with Filtering
```typescript
async function getFundsWithPositions(): Promise<FundWithPositions[]> {
  const funds = await prismaClient.wiretap_fund.findMany({
    where: {
      positions: {
        some: {
          number_shares_held: { gt: 0 }  // Has active positions
        }
      }
    },
    select: { wiretap_fund_uuid: true, current_account_balance_usd: true }
  })

  // Transform and type-cast results
  return funds.map(fund => ({
    wiretapFundUuid: fund.wiretap_fund_uuid as FundsUUID,
    currentAccountBalanceUsd: fund.current_account_balance_usd
  }))
}
```

**Key points**:
- Filters at database level for performance
- Minimal field selection
- Transforms snake_case to camelCase
- Type-casts Prisma types to domain types

### Complex Aggregated Queries (Transactions)
```typescript
export default async function retrieveDetailedFundData(
  fundUUID: FundsUUID
): Promise<DetailedSingleFund> {
  const [purchaseOrders, saleOrders, portfolioSnapshots] =
    await prismaClient.$transaction([
      // Query 1: All purchase orders with related data
      prismaClient.purchase_order.findMany({
        where: { wiretap_fund_uuid: fundUUID },
        select: {
          number_of_shares: true,
          total_cost: true,
          outcome: { select: { outcome: true, market: { ... } } }
        }
      }),
      // Query 2: All sale orders
      prismaClient.sale_order.findMany({ ... }),
      // Query 3: Portfolio history
      prismaClient.portfolio_snapshot.findMany({ ... })
    ])

  // Transform and aggregate results
  return {
    fundUUID,
    transactions: { purchaseOrders, saleOrders },
    portfolioHistory
  }
}
```

**Key points**:
- Uses `$transaction()` for consistency
- Multiple queries executed together
- Relationship selection for nested data
- Complex data transformation post-query

---

## Domain-Specific Read Operations

### Credentials (`credentials/`)
**Purpose**: Authentication and user identification

**Common operations**:
- Retrieve user ID by email
- Check if user is active
- Validate credentials

**Key details**:
- Returns `null` if user not found
- Returns `undefined` if user inactive (special case)
- Email comparison case-insensitive where needed

### Fund Data (`wiretap-fund/`)
**Purpose**: Portfolio and fund information

**Common operations**:
- List user's funds
- Get fund details with positions
- Retrieve cash balance
- Get funds with active positions

**Key details**:
- Multiple levels of relationship selection
- Portfolio snapshot history (last 24 hours)
- Position aggregation
- Cash balance tracking

### Positions (`position/`)
**Purpose**: Holdings and position tracking

**Common operations**:
- Find position by outcome and fund
- List all positions for fund
- Check share count

**Key details**:
- Links funds, outcomes, markets, events
- Share count for value calculation
- Average cost tracking

### Polymarket Data (`polymarket-event/`, `polymarket-outcome/`)
**Purpose**: Market metadata from Polymarket API

**Common operations**:
- Retrieve all events
- Find event by ID
- Get outcomes for market

**Key details**:
- Data synced from GAMMA API
- Used for market browsing endpoints
- Event slug for URL-friendly naming

### Portfolio Snapshots (`portfolio-snapshot/`)
**Purpose**: Historical portfolio value tracking

**Common operations**:
- Get snapshots for specific resolution (1, 5, 30, 180 min)
- Time-range filtering
- Data for charting/analytics

**Key details**:
- Multiple time resolutions
- Ordered by timestamp for consistency
- Used for fund performance analysis

### Existence Checks (`does-x-exist/`)
**Purpose**: Quick boolean checks

**Common patterns**:
- User exists and is active
- Fund exists and user owns it
- Position exists for fund
- Email already registered

**Key details**:
- Returns boolean only (not objects)
- Minimal query for performance
- Used for validation before operations

---

## Query Optimization Patterns

### 1. Minimal Field Selection
Only select fields you need:
```typescript
select: {
  wiretap_fund_uuid: true,
  current_account_balance_usd: true
  // Don't select: fund_name, user_id, created_at unless needed
}
```

### 2. Where Clause Filtering
Filter at database level, not in application:
```typescript
where: {
  is_active: true,  // Database filters
  positions: { some: { number_shares_held: { gt: 0 } } }
}
```

### 3. Relationship Loading
Be deliberate about nested data:
```typescript
select: {
  outcome: {
    select: {
      outcome: true,
      market: {
        select: {
          question: true,
          event: { select: { event_slug: true } }
        }
      }
    }
  }
}
```

### 4. Transactions for Consistency
Use `$transaction()` when multiple queries must be consistent:
```typescript
await prismaClient.$transaction([
  query1,
  query2,
  query3
])
```

---

## Return Value Patterns

### Null Handling
```typescript
// Not found → null
Promise<Type | null>

// Not found AND inactive → undefined (special case)
Promise<Type | null | undefined>
```

### Collections
Always return array (never null):
```typescript
Promise<Type[]>  // Empty array if no results
```

### Transformed Data
Return domain types, not Prisma types:
```typescript
return funds.map(fund => ({
  wiretapFundUuid: fund.wiretap_fund_uuid as FundsUUID,
  currentAccountBalanceUsd: fund.current_account_balance_usd
}))
```

---

## When Adding New Read Operations

1. **Determine domain**: Which feature/domain does this serve?
2. **Choose location**: Create file in appropriate subdirectory or add to existing file
3. **Follow patterns**: Use existing function signature and error handling pattern
4. **Minimal selection**: Only select fields you need
5. **Type safety**: Use branded types and type casting
6. **Error handling**: Log and throw errors
7. **Documentation**: Add JSDoc if complex query logic
8. **Update main CLAUDE.md**: Document new operation if significant

---

## Related Files
- `../write/` - Write operations (create, update, delete)
- `../../classes/prisma-client.ts` - Prisma client initialization
- `../../types/` - Type definitions for return values
- `../../jobs/` - Background jobs that use these operations
- `../../controllers/` - Route handlers that call these operations

## Prisma Resources
- [Prisma Query Documentation](https://www.prisma.io/docs/orm/prisma-client/queries)
- [Relations and Includes](https://www.prisma.io/docs/orm/prisma-client/relations/select-fields)
- [Filtering and Where Clause](https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting)
