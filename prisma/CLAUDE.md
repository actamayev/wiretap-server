# Prisma Directory

This directory contains the Prisma ORM schema definition and migration history for the Wiretap application database.

## Structure

```
prisma/
├── schema.prisma        # Database schema definition (all models, enums, relationships)
└── migrations/          # Migration history (timestamped SQL files for version control)
    ├── migration_1/
    ├── migration_2/
    └── ...
```

## schema.prisma

The single source of truth for the database structure. Defines all models, relationships, and constraints.

### Configuration

```prisma
generator client {
  provider = "prisma-client"
  output = "../src/generated/prisma"  // Generated Prisma client location
  moduleFormat = "cjs"                // CommonJS format
}

datasource db {
  provider = "postgresql"             // PostgreSQL database
}
```

### Enums

#### AuthMethods
```prisma
enum AuthMethods {
  WIRETAP  // Local email/password authentication
  GOOGLE   // Google OAuth authentication
}
```

---

## Database Models

### User Management

#### credentials (User Accounts)
Stores user authentication data and account information.

**Fields**:
- `user_id` (Int, PK, auto-increment): Unique user identifier
- `password` (String, optional): Hashed password (null for Google users)
- `is_active` (Boolean): Account status (soft delete alternative)
- `auth_method` (AuthMethods): Login type (WIRETAP or GOOGLE)
- `email` (String, unique): Email address
- `created_at` (DateTime): Account creation timestamp
- `updated_at` (DateTime): Last modification timestamp

**Relations**:
- `login_history`: One-to-many login records
- `wiretap_fund`: One-to-many funds owned by user
- `user_feedback`: One-to-many feedback submissions

**Indexes**:
- `email` (unique)
- `user_id` (primary key)

**Key details**:
- Email is unique (one account per email)
- Password null for Google-authenticated users
- `is_active` used instead of deleting records (data preservation)

---

#### login_history
Tracks user login events for security and analytics.

**Fields**:
- `login_history_id` (Int, PK, auto-increment): Unique record ID
- `user_id` (Int, FK): Reference to credentials.user_id
- `login_time` (DateTime): When login occurred (default: now)

**Relations**:
- `user`: Many-to-one reference to credentials

**Indexes**:
- `user_id` (for fast lookup by user)

---

#### user_feedback
Stores user feedback submissions.

**Fields**:
- `user_feedback_id` (Int, PK, auto-increment): Unique feedback ID
- `user_id` (Int, FK): Reference to credentials.user_id
- `feedback` (String): Feedback content
- `created_at` (DateTime): Submission timestamp

**Relations**:
- `user`: Many-to-one reference to credentials

**Indexes**:
- `user_id` (for retrieving user's feedback)

---

#### email_update_subscriber
Tracks email subscribers for marketing communications.

**Fields**:
- `email_update_subscriber_id` (Int, PK, auto-increment): Unique subscriber ID
- `email` (String, unique): Subscriber email
- `ip_address` (String, optional): IP address at signup
- `user_agent` (String, optional): Browser info (helps identify bots)
- `created_at` (DateTime): Subscription timestamp

**Key details**:
- Separate from credentials table (can subscribe before creating account)
- User agent helps filter bot signups

---

### Portfolio Management

#### wiretap_fund (User Portfolios)
Represents a user's trading fund/account.

**Fields**:
- `wiretap_fund_uuid` (String, PK): UUID identifier for fund
- `user_id` (Int, FK): Reference to credentials.user_id
- `fund_name` (String): User-defined fund name
- `starting_account_balance_usd` (Float): Initial balance
- `current_account_balance_usd` (Float): Current cash balance
- `is_primary_fund` (Boolean): Default fund for user
- `is_starting_fund` (Boolean): Created at registration (auto-generated)
- `created_at` (DateTime): Fund creation timestamp
- `updated_at` (DateTime): Last modification timestamp

**Relations**:
- `user`: Many-to-one reference to credentials
- `purchase_orders`: One-to-many trades
- `sales_orders`: One-to-many trades
- `positions`: One-to-many current holdings
- `portfolio_snapshot`: One-to-many historical values

**Key details**:
- Users can have multiple funds (portfolios)
- UUID used for external API reference (not incrementing ID)
- `is_starting_fund` created automatically on user registration
- `is_primary_fund` indicates default fund for operations
- `current_account_balance_usd` decremented on buy, incremented on sell

---

#### position (Current Holdings)
Represents a user's current holdings in a specific outcome.

**Fields**:
- `position_id` (Int, PK, auto-increment): Unique position ID
- `clob_token_id` (String, FK): Reference to polymarket_outcome.clob_token_id
- `number_shares_held` (Float): Current share count
- `average_cost_per_share` (Float): Cost basis per share
- `total_cost` (Float): Total cost basis
- `wiretap_fund_uuid` (String, FK): Reference to wiretap_fund
- `created_at` (DateTime): Position creation timestamp
- `updated_at` (DateTime): Last modification timestamp

**Relations**:
- `wiretap_fund`: Many-to-one reference to fund
- `outcome`: Many-to-one reference to polymarket_outcome

**Indexes**:
- `wiretap_fund_uuid` (find all positions for fund)

**Key details**:
- One position per fund per outcome
- `number_shares_held` updated on buy (+) and sell (-)
- Average cost updates when buying more at different price
- Used for portfolio valuation and position tracking

---

#### purchase_order (Buy Transactions)
Records every purchase made.

**Fields**:
- `purchase_id` (Int, PK, auto-increment): Unique order ID
- `clob_token_id` (String, FK): Outcome purchased
- `number_of_shares` (Float): Shares purchased
- `price_per_share` (Float): Price at purchase
- `total_cost` (Float): Total transaction cost
- `wiretap_fund_uuid` (String, FK): Fund that purchased
- `created_at` (DateTime): Order timestamp
- `updated_at` (DateTime): Last modification timestamp

**Relations**:
- `wiretap_fund`: Many-to-one reference to fund
- `outcome`: Many-to-one reference to polymarket_outcome

**Indexes**:
- `wiretap_fund_uuid` (find all purchases for fund)
- `clob_token_id` (find all purchases of outcome)

**Key details**:
- Immutable record (never updated, only created)
- Used for transaction history and audit trail
- `price_per_share` captured at purchase (for cost basis calculation)

---

#### sale_order (Sell Transactions)
Records every sale made.

**Fields**:
- `sale_id` (Int, PK, auto-increment): Unique order ID
- `clob_token_id` (String, FK): Outcome sold
- `number_of_shares` (Float): Shares sold
- `price_per_share` (Float): Price at sale
- `total_proceeds` (Float): Total sale revenue
- `realized_pnl` (Float): Profit/loss on sale
- `wiretap_fund_uuid` (String, FK): Fund that sold
- `created_at` (DateTime): Order timestamp
- `updated_at` (DateTime): Last modification timestamp

**Relations**:
- `wiretap_fund`: Many-to-one reference to fund
- `outcome`: Many-to-one reference to polymarket_outcome

**Indexes**:
- `wiretap_fund_uuid` (find all sales for fund)
- `clob_token_id` (find all sales of outcome)

**Key details**:
- Immutable record (audit trail)
- `realized_pnl` calculated at sale time
- Used for transaction history and performance tracking

---

#### portfolio_snapshot (Historical Values)
Periodic snapshots of portfolio value for charting and analytics.

**Fields**:
- `snapshot_id` (Int, PK, auto-increment): Unique snapshot ID
- `wiretap_fund_uuid` (String, FK): Fund snapshot
- `total_value` (Float): Total portfolio value at snapshot time
- `timestamp` (DateTime): When snapshot was taken
- `resolution_minutes` (Int): Time resolution (1, 5, 30, 180)

**Relations**:
- `wiretap_fund`: Many-to-one reference to fund

**Indexes**:
- Unique constraint: `(wiretap_fund_uuid, timestamp, resolution_minutes)` - one snapshot per resolution per time
- Index: `(wiretap_fund_uuid, resolution_minutes, timestamp)` - fast retrieval by fund and resolution
- Index: `(resolution_minutes, timestamp)` - efficient queries across all funds

**Key details**:
- Multiple resolutions allow efficient data aggregation:
  - **1-minute**: Detailed intraday tracking (kept 1 hour)
  - **5-minute**: Standard resolution (kept 1 day)
  - **30-minute**: Daily analysis (kept 1 week)
  - **180-minute** (3 hours): Weekly trends (kept 1 month)
- Older snapshots deleted by cleanup job based on resolution
- Used for charting portfolio performance over time

---

### Polymarket Data

#### polymarket_event (Prediction Markets)
Represents a Polymarket event (e.g., "Will Bitcoin reach $100k by EOY?").

**Fields**:
- `event_id` (String, PK): Polymarket event ID
- `title` (String): Event title
- `description` (String): Event description
- `event_slug` (String, unique): URL-friendly slug
- `active` (Boolean): Event accepting trades
- `archived` (Boolean): Event archived (not displayed)
- `closed` (Boolean): Event resolution closed
- `closed_time` (DateTime, optional): When event closed
- `start_date` (DateTime, optional): Event start date
- `end_date` (DateTime, optional): Event resolution date
- `total_volume` (Float, optional): Aggregated volume across all markets
- `polymarket_url` (String): URL to event on Polymarket
- `image_url` (String, optional): Event image
- `icon_url` (String, optional): Event icon
- `created_at` (DateTime): When synced to our DB
- `updated_at` (DateTime): Last update from sync

**Relations**:
- `markets`: One-to-many polymarket_market entries

**Indexes**:
- `event_id` (primary key)
- `event_slug` (unique, for URL lookups)

**Key details**:
- Synced from Polymarket GAMMA API every 5 minutes
- One event can have multiple markets (e.g., presidential election has many nominee markets)
- Used for event listing and filtering

---

#### polymarket_market (Tradeable Markets)
Represents a specific tradeable market within an event.

**Fields**:
- `market_id` (Int, PK, auto-increment): Internal ID
- `condition_id` (String, unique): Polymarket's condition ID (the key identifier)
- `event_id` (String, FK): Reference to polymarket_event
- `question` (String, optional): The specific market question
- `active` (Boolean): Market accepting trades
- `closed` (Boolean): Market closed/resolved
- `accepting_orders` (Boolean): Whether orders accepted
- `last_trade_price` (Float, optional): Latest trade price
- `best_bid` (Float, optional): Current best bid
- `best_ask` (Float, optional): Current best ask
- `midpoint_price` (Float, optional): Mid-point price
- `spread` (Float, optional): Bid-ask spread
- `group_item_title` (String, optional): Group heading
- `image_url` (String, optional): Market image
- `icon_url` (String, optional): Market icon
- `volume` (Float, optional): Market volume
- `volume_total` (Float, optional): Total volume
- `created_at` (DateTime): When synced
- `updated_at` (DateTime): Last update

**Relations**:
- `event`: Many-to-one reference to polymarket_event
- `outcomes`: One-to-many polymarket_outcome entries

**Indexes**:
- `market_id` (primary key)
- `condition_id` (unique)
- `event_id` (for finding markets in event)

**Key details**:
- `condition_id` is the unique identifier from Polymarket
- One event can have multiple markets with different questions
- Markets always have exactly 2 outcomes (Yes/No, etc.)
- Synced from GAMMA API every 5 minutes

---

#### polymarket_outcome (Market Outcomes)
Represents a possible outcome of a market (e.g., "Yes" or "No").

**Fields**:
- `clob_token_id` (String, PK): CLOB token ID (unique identifier for outcome)
- `market_id` (Int, FK): Reference to polymarket_market
- `outcome` (String): Outcome text (e.g., "Yes", "No", "Team A", "Team B")
- `outcome_index` (Int): Position in outcomes array (0, 1, 2...)
- `winning_outcome` (Boolean): Whether this outcome won (resolution)
- `created_at` (DateTime): When synced
- `updated_at` (DateTime): Last update

**Relations**:
- `market`: Many-to-one reference to polymarket_market (with cascade delete)
- `purchase_orders`: One-to-many buy orders
- `sale_orders`: One-to-many sell orders
- `positions`: One-to-many current holdings

**Indexes**:
- `clob_token_id` (primary key)
- Unique constraint: `(market_id, outcome_index)` - ensure outcome per market is unique
- Index: `market_id` (find all outcomes for market)

**Key details**:
- Markets always have 2 outcomes
- `clob_token_id` is the key used in position and trade tracking
- `outcome_index` tracks position (0=first, 1=second)
- `winning_outcome` set to true when market resolves
- Cascade delete: if market deleted, outcomes deleted too

---

## Key Relationships Diagram

```
credentials (user)
├─ wiretap_fund (fund)
│  ├─ position → polymarket_outcome
│  ├─ purchase_order → polymarket_outcome
│  ├─ sale_order → polymarket_outcome
│  └─ portfolio_snapshot
├─ login_history
├─ user_feedback
└─ email_update_subscriber

polymarket_event (event)
└─ polymarket_market (market)
   └─ polymarket_outcome (outcome: Yes/No)
      ├─ position
      ├─ purchase_order
      └─ sale_order
```

---

## Important Constraints and Indexes

### Unique Constraints
- `credentials.email`: One account per email
- `polymarket_event.event_slug`: One slug per event
- `polymarket_market.condition_id`: One market per condition ID
- `polymarket_outcome(market_id, outcome_index)`: One outcome at each position per market
- `portfolio_snapshot(wiretap_fund_uuid, timestamp, resolution_minutes)`: One snapshot per resolution per time

### Key Indexes
- `login_history.user_id`: Fast login lookup by user
- `user_feedback.user_id`: Fast feedback lookup by user
- `purchase_order(wiretap_fund_uuid, clob_token_id)`: Fast trade lookup
- `sale_order(wiretap_fund_uuid, clob_token_id)`: Fast trade lookup
- `position.wiretap_fund_uuid`: Fast position lookup by fund
- `polymarket_market.event_id`: Fast market lookup by event
- `polymarket_outcome.market_id`: Fast outcome lookup by market
- `portfolio_snapshot(wiretap_fund_uuid, resolution_minutes, timestamp)`: Fast historical lookup

---

## Migrations

Migrations are timestamped SQL files in the `migrations/` directory. Prisma applies them sequentially to evolve the schema.

### Migration Workflow

1. **Modify schema.prisma** with desired changes
2. **Create migration**: `npx prisma migrate dev --name <description>`
3. **Review migration file**: Check generated SQL in `migrations/<timestamp>_<name>/migration.sql`
4. **Apply to database**: Automatically applied during creation
5. **Commit to git**: Migration SQL is committed for version control

### Recent Migration History

- `20251126165219_create_email_subscriber_table`: Initial subscriber tracking
- `20251127160352_add_credentials_table`: User authentication
- `20251127172041_add_transaction_and_account_tables`: Fund and trading tables
- `20251202051152_add_polymarket_tables`: Event, market, outcome tables
- `20251204160718_rename_to_fund`: Rename brokerage to fund
- `20251207182215_add_portfolio_snapshot`: Portfolio value history
- `20251208161832_add_user_feedback`: Feedback collection

---

## Key Design Decisions

### 1. UUID for Funds
- `wiretap_fund_uuid` uses string UUID (not auto-increment)
- Reason: Safe for external API exposure (no sequential predictability)
- Generated in application code during fund creation

### 2. Polymarket IDs
- `event_id`: String (Polymarket's ID format)
- `condition_id`: String (64-character hex)
- `clob_token_id`: String (unique token identifier)
- Reason: Match Polymarket API data exactly

### 3. Multiple Portfolio Snapshots
- Multiple resolutions (1, 5, 30, 180 min) stored separately
- Different retention periods per resolution
- Reason: Balance storage vs query efficiency
- Allows efficient charting at different time scales

### 4. Position vs Orders
- `position`: Current holdings (mutable, updated)
- `purchase_order` + `sale_order`: Immutable transaction records
- Reason: Audit trail + fast position lookup

### 5. Soft Deletes (is_active)
- Users not deleted, `is_active` set to false
- Reason: Preserve historical data and transaction records

---

## Common Operations

### Get All User Funds
```prisma
wiretap_fund.findMany({
  where: { user_id: userId }
})
```

### Get Fund with All Positions
```prisma
wiretap_fund.findUnique({
  where: { wiretap_fund_uuid },
  include: { positions: true }
})
```

### Get Portfolio History
```prisma
portfolio_snapshot.findMany({
  where: {
    wiretap_fund_uuid,
    resolution_minutes: 5
  },
  orderBy: { timestamp: 'asc' }
})
```

### Execute Buy Order (with transaction)
```prisma
$transaction(async (tx) => {
  // Fetch fund
  const fund = await tx.wiretap_fund.findUnique(...)
  // Decrement balance
  await tx.wiretap_fund.update({
    data: { current_account_balance_usd: { decrement } }
  })
  // Create purchase order
  await tx.purchase_order.create(...)
  // Upsert position
  await tx.position.upsert(...)
})
```

---

## Database Setup

### Initialize Database
```bash
npx prisma migrate dev --name init
```

### Generate Prisma Client
```bash
npx prisma generate
```

### View Database
```bash
npx prisma studio  # Opens web UI
```

### Reset Database (dev only)
```bash
npx prisma migrate reset  # Drops and recreates
```

---

## When Modifying Schema

1. **Update schema.prisma**: Add/modify models, fields, relationships
2. **Create migration**: `npx prisma migrate dev --name description`
3. **Review SQL**: Verify generated migration is correct
4. **Test**: Ensure application still works with changes
5. **Commit**: Add migration SQL and schema.prisma to git
6. **Deploy**: Run `prisma migrate deploy` in production

---

## Related Files
- `../src/generated/prisma/`: Generated Prisma client (auto-generated, do not edit)
- `../src/db-operations/`: Database operations using Prisma client
- `../src/classes/prisma-client.ts`: Prisma client initialization
