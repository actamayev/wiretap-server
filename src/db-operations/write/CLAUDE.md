# DB Operations: Write Directory

This directory contains all write operations (create, update, delete, upsert) using Prisma ORM. Operations are organized by domain/feature and include support for complex multi-step transactions.

## Structure

```
write/
├── credentials/                     # User account creation
│   ├── add-user.ts                 # Create local and Google users
│   └── update-password.ts          # Change password
├── email-update-subscriber/        # Email subscription management
├── feedback/                       # User feedback storage
├── login-history/                  # Track login events
├── polymarket-event/               # Event data upserts
│   └── upsert-polymarket-event.ts
├── polymarket-market/              # Market data upserts
│   └── upsert-polymarket-market.ts
├── polymarket-outcome/             # Outcome data upserts
├── portfolio-snapshot/             # Store portfolio value snapshots
├── wiretap-fund/                   # Fund creation and updates
│   ├── create-wiretap-fund.ts
│   └── create-starting-fund-for-user.ts
└── simultaneous-writes/            # Complex transaction operations
    ├── execute-buy-order.ts        # Buy with position & balance updates
    └── execute-sell-order.ts       # Sell with position & balance updates
```

## Design Principles

### 1. Single Responsibility
Each operation does one coherent thing:
- Create user
- Update password
- Upsert market data
- Execute trade with all side effects

### 2. Fail-Fast on Errors
All errors logged and thrown immediately:
```typescript
if (!fund) {
  console.error("Fund not found")
  throw new Error("Fund not found")
}
```

### 3. Transaction Safety
Complex operations wrap multiple queries in `$transaction()`:
```typescript
const result = await prismaClient.$transaction(async (tx) => {
  const fund = await tx.wiretap_fund.findUnique({ ... })
  await tx.wiretap_fund.update({ ... })
  const position = await tx.position.upsert({ ... })
  return { fund, position }
})
```

### 4. Return Type Clarity
Return what caller needs:
- `void`: Fire-and-forget operations
- IDs: When created entity ID is needed
- Objects: When full result needed
- Transaction results: For complex operations

---

## Write Operation Patterns

### Simple Create
```typescript
export async function addLocalUser(data: NewLocalUserFields): Promise<number> {
  try {
    const prismaClient = await PrismaClientClass.getPrismaClient()
    const user = await prismaClient.credentials.create({ data })
    return user.user_id  // Return ID for downstream use
  } catch (error) {
    console.error(error)
    throw error
  }
}
```

**Key points**:
- Minimal error handling (log and throw)
- Return newly created ID or entity
- Input data is already validated

### Upsert (Insert or Update)
```typescript
export default async function upsertPolymarketEvent(
  event: PolymarketEvent
): Promise<void> {
  await prismaClient.polymarket_event.upsert({
    where: { event_id: event.id },  // Unique identifier
    update: {                        // Fields to update if exists
      title: event.title,
      active: event.active,
      closed: event.closed,
    },
    create: {                        // Fields to create if new
      event_id: event.id,
      event_slug: event.slug,
      title: event.title,
      // ... all required fields
    }
  })
}
```

**Key points**:
- Idempotent (safe to run multiple times)
- Separate update vs create fields
- Returns void (fire-and-forget)
- Used for syncing API data

### Complex Transaction (Multiple Steps)
```typescript
export default async function executeBuyOrder(
  params: ExecuteBuyOrderParams
): Promise<ExecuteBuyOrderResult> {
  const prismaClient = await PrismaClientClass.getPrismaClient()

  const result = await prismaClient.$transaction(async (tx: TransactionClient) => {
    // STEP 1: Fetch and validate
    const fund = await tx.wiretap_fund.findUnique({
      where: { wiretap_fund_uuid: params.wiretapFundUuid }
    })
    if (!fund) throw new Error("Fund not found")

    // STEP 2: Check balance
    const totalCost = params.pricePerShare * params.numberOfSharesPurchasing
    if (fund.current_account_balance_usd < totalCost) {
      throw new Error("Insufficient funds")
    }

    // STEP 3: Decrement balance
    await tx.wiretap_fund.update({
      where: { wiretap_fund_uuid: params.wiretapFundUuid },
      data: {
        current_account_balance_usd: {
          decrement: totalCost
        }
      }
    })

    // STEP 4: Create purchase order
    const purchaseOrder = await tx.purchase_order.create({
      data: {
        wiretap_fund_uuid: params.wiretapFundUuid,
        clob_token_id: params.clobToken,
        number_of_shares: params.numberOfSharesPurchasing,
        total_cost: totalCost
      }
    })

    // STEP 5: Upsert position
    const position = await tx.position.upsert({
      where: {
        wiretap_fund_uuid_clob_token_id: {
          wiretap_fund_uuid: params.wiretapFundUuid,
          clob_token_id: params.clobToken
        }
      },
      update: {
        number_of_shares_held: { increment: params.numberOfSharesPurchasing }
      },
      create: {
        wiretap_fund_uuid: params.wiretapFundUuid,
        clob_token_id: params.clobToken,
        number_of_shares_held: params.numberOfSharesPurchasing
      }
    })

    return { purchaseId: purchaseOrder.id, position, totalCost }
  })

  return result
}
```

**Key points**:
- All steps in single transaction (all-or-nothing)
- Validation checks early (STEP 2)
- Logical operation order
- Increment/decrement for balance updates
- Upsert for position (create new or add to existing)
- Returns full result for caller

---

## Domain-Specific Write Operations

### Credentials (`credentials/`)
**Purpose**: User account management

**Operations**:
- `addLocalUser()` - Create local user with password
- `addGoogleUser()` - Create user from Google OAuth
- `updatePassword()` - Change user's password

**Key details**:
- Password already hashed before arrival
- Auth method stored (LOCAL or GOOGLE)
- One insert per new user
- Password updates replace entire password

### Polymarket Data (`polymarket-event/`, `polymarket-market/`, `polymarket-outcome/`)
**Purpose**: Sync data from Polymarket API

**Operations**:
- `upsertPolymarketEvent()` - Insert or update event
- `upsertPolymarketMarket()` - Insert or update market
- `upsertPolymarketOutcome()` - Insert or update outcome

**Key details**:
- All use upsert for idempotency
- Safe to run repeatedly (market sync job)
- Sync happens every 5 minutes
- Updates only changed fields

### Fund Management (`wiretap-fund/`)
**Purpose**: Create and manage user portfolios

**Operations**:
- `createWiretapFund()` - Create new fund for user
- `createStartingFundForUser()` - Create initial fund on registration

**Key details**:
- Generate UUID for fund identifier
- Track starting and current cash balance
- Users can have multiple funds
- Initial balance set at creation

### Trading Operations (`simultaneous-writes/`)
**Purpose**: Execute trades with all side effects

**Operations**:
- `executeBuyOrder()` - Purchase shares with transaction safety
- `executeSellOrder()` - Sell shares with transaction safety

**Key details**:
- Wrapped in transactions (all-or-nothing)
- Multiple steps: fetch, validate, update, record
- Decrement/increment balance atomically
- Create purchase/sale order record
- Upsert position (add to existing or create new)
- Return result for response

**Buy Order Steps**:
1. Fetch fund and validate exists
2. Check sufficient cash balance
3. Decrement account balance
4. Create purchase order record
5. Upsert position (add shares, update cost basis)

**Sell Order Steps**:
1. Fetch fund and position
2. Check sufficient shares held
3. Increment account balance
4. Create sale order record
5. Decrement position (remove shares)
6. Delete position if zero shares

### Portfolio Snapshots (`portfolio-snapshot/`)
**Purpose**: Record portfolio values for history

**Operations**:
- `createPortfolioSnapshot()` - Record current portfolio value

**Key details**:
- Multiple resolutions (1, 5, 30, 180 min)
- One snapshot per resolution per fund
- Timestamp for time-series data
- Used for charting and analytics

### Login History (`login-history/`)
**Purpose**: Track user login events

**Operations**:
- `recordLoginEvent()` - Log successful login

**Key details**:
- Timestamp for when login occurred
- User ID and IP/session info
- Used for security and analytics

### Feedback (`feedback/`)
**Purpose**: Store user feedback

**Operations**:
- `addFeedback()` - Record user feedback

**Key details**:
- Links to user ID
- Feedback text
- Timestamp
- Used for product improvement

---

## Transaction Safety

### When to Use Transactions
Use `$transaction()` when:
- Multiple queries must maintain consistency
- Operations depend on each other
- All-or-nothing semantics needed
- Example: Buy order must update balance AND position together

### Transaction Pattern
```typescript
const result = await prismaClient.$transaction(async (tx: TransactionClient) => {
  // All queries use 'tx' instead of 'prismaClient'
  const item = await tx.table.operation(...)
  await tx.other_table.operation(...)
  return result
})
// If any query fails, entire transaction rolls back
```

### Isolation Level
- Default: READ_COMMITTED
- Suitable for most operations
- Race conditions handled by database locks

---

## Error Handling Strategy

### Pre-checks Before Write
```typescript
// Check existence
if (!fund) throw new Error("Fund not found")

// Check conditions
if (balance < cost) throw new Error("Insufficient funds")

// Check ownership
if (fund.user_id !== userId) throw new Error("Unauthorized")
```

### Error Logging
```typescript
try {
  // operation
} catch (error) {
  console.error("Specific context:", error)  // Always log
  throw error  // Always throw
}
```

### Caller Responsibility
- Caller catches and handles throws
- Caller returns appropriate HTTP status
- Caller logs user-facing errors

---

## Atomic Operations

### Increment/Decrement
For numeric fields, use Prisma operations:
```typescript
await prismaClient.wiretap_fund.update({
  where: { id },
  data: {
    current_account_balance_usd: { increment: 100 }
    // or: { decrement: 100 }
  }
})
```

**Advantages**:
- Atomic at database level
- Avoids race conditions
- No fetch-modify-update pattern needed

---

## When Adding New Write Operations

1. **Determine scope**: Single record or multiple related records?
2. **Check requirements**: Need transaction or simple operation?
3. **Define return type**: What does caller need (ID, object, void)?
4. **Add validation**: Pre-checks before write
5. **Implement transaction if needed**: Multiple related writes
6. **Error handling**: Log and throw all errors
7. **Testing**: Verify transaction rollback on errors
8. **Documentation**: Add JSDoc for complex operations

---

## Related Files
- `../read/` - Read operations (queries)
- `../../classes/prisma-client.ts` - Prisma client initialization
- `../../types/` - Type definitions for operation parameters
- `../../controllers/` - Route handlers that call these operations
- `../../jobs/` - Background jobs that sync data
- `../../middleware/` - Validation before operations

## Prisma Resources
- [Prisma Create](https://www.prisma.io/docs/orm/prisma-client/queries/crud#create)
- [Prisma Update](https://www.prisma.io/docs/orm/prisma-client/queries/crud#update)
- [Prisma Upsert](https://www.prisma.io/docs/orm/prisma-client/queries/crud#upsert)
- [Transactions](https://www.prisma.io/docs/orm/prisma-client/transactions)
