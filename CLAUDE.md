# Wiretap Server - Global Documentation

**Wiretap** is a prediction market trading platform that allows users to buy and sell shares in outcomes of prediction markets on Polymarket. This is the backend API server that powers the platform.

## Quick Links to Directory Documentation

Each major directory has its own CLAUDE.md file with detailed documentation:

| Directory | Purpose | Documentation |
|-----------|---------|---------------|
| `src/types/` | TypeScript type definitions | [CLAUDE.md](src/types/CLAUDE.md) |
| `src/classes/` | Reusable utility classes (Singleton, Hash, Prisma, Cache, SecretsManager) | [CLAUDE.md](src/classes/CLAUDE.md) |
| `src/jobs/` | Background jobs (sync markets, portfolio snapshots, cleanup) | [CLAUDE.md](src/jobs/CLAUDE.md) |
| `src/routes/` | API endpoint route definitions | [CLAUDE.md](src/routes/CLAUDE.md) |
| `src/utils/` | Utility functions organized by feature | [See subdirectories](#utils-subdirectories) |
| `src/db-operations/read/` | Database read queries | [CLAUDE.md](src/db-operations/read/CLAUDE.md) |
| `src/db-operations/write/` | Database write operations | [CLAUDE.md](src/db-operations/write/CLAUDE.md) |
| `src/middleware/` | Express request middleware | [CLAUDE.md](src/middleware/CLAUDE.md) |
| `prisma/` | Database schema and migrations | [CLAUDE.md](prisma/CLAUDE.md) |

### Utils Subdirectories

| Subdirectory | Purpose | Documentation |
|--------------|---------|---------------|
| `src/utils/auth-helpers/` | JWT token signing and verification | [CLAUDE.md](src/utils/auth-helpers/CLAUDE.md) |
| `src/utils/config/` | Application configuration (routes, CORS) | [CLAUDE.md](src/utils/config/CLAUDE.md) |
| `src/utils/emails/` | Email sending utilities (Resend) | [CLAUDE.md](src/utils/emails/CLAUDE.md) |
| `src/utils/google/` | Google OAuth authentication | [CLAUDE.md](src/utils/google/CLAUDE.md) |
| `src/utils/polymarket/` | Polymarket API integration | [CLAUDE.md](src/utils/polymarket/CLAUDE.md) |

---

## Project Overview

### What is Wiretap?

Wiretap is a web application that connects users to Polymarket prediction markets. Users can:
- Create trading accounts/funds
- Browse Polymarket events and markets
- Buy and sell shares in market outcomes
- Track portfolio performance with historical snapshots
- Submit feedback

### Technology Stack

**Runtime**: Node.js with TypeScript
**API Framework**: Express.js
**Database**: PostgreSQL with Prisma ORM
**Authentication**: JWT (local) + Google OAuth
**Email**: Resend
**Secrets**: AWS Secrets Manager
**Deployment**: PM2 on AWS

**Key Libraries**:
- `express`: HTTP server
- `prisma`: ORM and migrations
- `jsonwebtoken`: JWT handling
- `bcrypt`: Password hashing
- `joi`: Request validation
- `axios`: HTTP client for APIs
- `cors`: CORS middleware
- `express-rate-limit`: Rate limiting
- `google-auth-library`: OAuth integration
- `resend`: Email sending

---

## Architecture Overview

### Request Flow

```
Client Request
  ↓
[Global Middleware: CORS, JSON, Cookies]
  ↓
[Route-Specific Middleware: Rate Limiting, JWT]
  ↓
[Request Validation: Joi schemas]
  ↓
[Data Attachment: Enrich request]
  ↓
[Authorization: Verify ownership/permissions]
  ↓
[Controller Handler]
  ↓
[DB Operations: Read/Write via Prisma]
  ↓
Response
```

### Core Components

#### 1. Routes (`src/routes/`)
- **Auth**: Login, register, logout, Google OAuth
- **Events**: Browse Polymarket events (public)
- **Trade**: Buy/sell operations (protected, transactional)
- **Funds**: Manage portfolios (protected)
- **Personal Info**: User account settings
- **Misc**: Feedback collection

#### 2. Middleware (`src/middleware/`)
- **Validation**: Request format and constraints
- **Authentication**: JWT token verification
- **Authorization**: Ownership and permission checks
- **Rate Limiting**: Prevent abuse (4 tiers)
- **Cookies**: Secure token management

#### 3. Controllers (`src/controllers/`)
- Route handler logic
- Coordinate between middleware and database
- Return formatted responses

#### 4. Database (`prisma/schema.prisma`)
- **Users**: Credentials, login history, feedback
- **Funds**: Portfolios, positions, transactions
- **Markets**: Events, markets, outcomes from Polymarket
- **History**: Portfolio snapshots for charting

#### 5. Background Jobs (`src/jobs/`)
- **Market Sync**: Fetch latest event/market data from Polymarket (every 5 minutes)
- **Resolution Sync**: Check for closed markets and update winning outcomes (every 5 minutes)
- **Portfolio Snapshots**: Record fund values at multiple resolutions (every 1 minute)
- **Cleanup**: Delete old snapshots by retention rules (every 1 hour)

#### 6. Classes (`src/classes/`)
- **Singleton**: Base class for infrastructure services
- **Hash**: Password hashing with bcrypt
- **PrismaClientClass**: Database connection management
- **EventsCache**: In-memory events cache with auto-refresh
- **SecretsManager**: AWS Secrets Manager integration

#### 7. Utilities
- **Auth Helpers**: JWT signing/verification
- **Polymarket API**: GAMMA and CLOB API clients
- **Config**: Route setup, CORS configuration
- **Emails**: Resend email templates
- **Google**: OAuth2 client setup

---

## Key Flows

### User Registration & Login

```
Register Request
  ↓ validateRegister (Joi validation)
  ↓ Hash password with bcrypt
  ↓ Create credentials in database
  ↓ Create starting fund
  ↓ Send welcome email
  ↓ Sign JWT token
  ↓ Set auth cookie
  ↓ Return 200 OK

Login Request
  ↓ validateLogin
  ↓ Find user by email
  ↓ Compare password with hash
  ↓ Sign JWT token
  ↓ Set auth cookie
  ↓ Return 200 OK
```

### Buy Shares Flow

```
POST /trade/buy/:fundUuid
  ↓ tradingRateLimiter (100 req/min per user)
  ↓ jwtVerifyAttachUserId (verify token)
  ↓ validateBuyShares (body validation)
  ↓ confirmFundExists (ownership check)
  ↓ validateOutcomeValid (outcome exists)
  ↓ validateBuyOrderAndFetchPrice (fetch current price)
  ↓ confirmSufficientFunds (balance check)
  ↓ executeBuyOrder (transaction):
      - Decrement fund balance
      - Create purchase_order record
      - Upsert position (add shares, update cost basis)
  ↓ Return 200 OK with position data
```

### Market Sync (Background Job)

```
syncMarkets() runs every 5 minutes
  ↓ Fetch 1000 active events from Polymarket GAMMA API
  ↓ For each event:
      - Upsert polymarket_event
      - For each market:
          - Skip if no conditionId
          - Upsert polymarket_market
          - Parse outcomes (Yes/No from JSON)
          - Upsert polymarket_outcome
  ↓ Log summary (events, markets, outcomes synced)
```

### Portfolio Snapshot (Background Job)

```
calculatePortfolioSnapshots() runs every 1 minute
  ↓ Get all funds with active positions
  ↓ Determine which resolutions to save:
      - Always: 1-minute
      - At :00, :05, :10... minutes: 5-minute
      - At :00, :30 minutes: 30-minute
      - Every 3 hours: 180-minute
  ↓ For each fund:
      - Get all positions
      - For each position:
          - Fetch current token price from CLOB API
          - Calculate position value (shares × price)
      - Sum position values
      - Total = cash + position values
      - Save portfolio_snapshot for each resolution
```

---

## Database Schema Summary

### Core Tables

**Users & Auth**:
- `credentials`: User accounts (email, password, auth method, active status)
- `login_history`: Login events
- `user_feedback`: User feedback submissions

**Funds & Trading**:
- `wiretap_fund`: User portfolios with cash balance
- `position`: Current holdings (shares, cost basis)
- `purchase_order`: Buy transactions (immutable)
- `sale_order`: Sell transactions with P&L (immutable)
- `portfolio_snapshot`: Historical portfolio values (multiple resolutions)

**Polymarket Data**:
- `polymarket_event`: Events (synced from API)
- `polymarket_market`: Individual markets (synced from API)
- `polymarket_outcome`: Market outcomes Yes/No (synced from API)

**Other**:
- `email_update_subscriber`: Marketing email subscribers

### Key Relationships
```
User (credentials)
  ↓ owns many
Fund (wiretap_fund)
  ├─ has many Positions → Outcomes
  ├─ has many Purchase Orders → Outcomes
  ├─ has many Sale Orders → Outcomes
  └─ has many Portfolio Snapshots

Event (polymarket_event)
  ↓ has many
Market (polymarket_market)
  ↓ has many
Outcome (polymarket_outcome)
```

### Constraints

- **Unique**: Email (one account per email)
- **Unique**: Event slug (one slug per event)
- **Unique**: Market condition_id (Polymarket identifier)
- **Unique**: Portfolio snapshot (one per resolution per time)
- **Cascade Delete**: Market deletion cascades to outcomes

---

## Environment Configuration

### Development (.env.local)

```
NODE_ENV=development
AWS_ACCESS_KEY_ID=<dev-key>
AWS_SECRET_ACCESS_KEY=<dev-secret>
DATABASE_URL=postgresql://user:pass@localhost:5432/wiretap
JWT_KEY=<dev-secret>
RESEND_API_KEY=<test-key>
GOOGLE_CLIENT_ID=<dev-client-id>
GOOGLE_CLIENT_SECRET=<dev-secret>
```

### Production (.env.production)

```
NODE_ENV=production
```
All secrets retrieved from AWS Secrets Manager (no local config).

---

## Running the Application

### Development

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm exec prisma generate

# Run dev server (auto-reload on file changes)
pnpm run dev

# Server runs on http://localhost:8080
```

### Building for Production

```bash
# Type check
pnpm run type-check

# Lint
pnpm run lint

# Build (TypeScript → JavaScript)
pnpm run build

# Output: dist/index.js
```

### Running in Production

```bash
# Start with PM2 (process manager)
pm2 start ecosystem.config.js

# View logs
pm2 logs

# Restart
pm2 restart wiretap-server

# Stop
pm2 stop wiretap-server
```

### Database

```bash
# Create migration (after schema.prisma change)
pnpm exec prisma migrate dev --name <description>

# Apply migrations
pnpm exec prisma migrate deploy

# View/manage database
pnpm exec prisma studio

# Reset database (dev only)
pnpm exec prisma migrate reset
```

---

## API Endpoints Summary

### Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/register` - Create new account
- `POST /auth/logout` - Logout
- `POST /auth/google-auth/login-callback` - Google OAuth callback

### Events (Public, No Auth)
- `GET /events/all-events?offset=0` - List all events
- `GET /events/single-event/:eventSlug` - Get event details

### Trading (Protected)
- `POST /trade/buy/:fundUuid` - Buy shares
- `POST /trade/sell/:fundUuid` - Sell shares

### Funds (Protected)
- `GET /funds/all-my-funds` - List user's funds
- `GET /funds/detailed-fund/:fundUuid` - Get fund with holdings
- `POST /funds/create-fund` - Create new fund
- `POST /funds/set-primary-fund/:fundUuid` - Set default fund
- `POST /funds/portfolio-history-by-resolution/:fundUuid` - Get historical snapshots

### User Account (Protected)
- `GET /personal-info/personal-info` - Get user profile
- `POST /personal-info/change-password` - Update password

### Misc (Protected)
- `POST /misc/user-feedback` - Submit feedback

### Health
- `GET /health` - Health check

---

## Rate Limiting

The API implements tiered rate limiting:

| Endpoint Type | Limit | Window | Per |
|---------------|-------|--------|-----|
| Auth (login/register) | 20 requests | 5 minutes | IP |
| Events (browsing) | 45 requests | 1 minute | IP |
| Trading (buy/sell) | 100 requests | 1 minute | User |
| General (account) | 45 requests | 1 minute | User/IP |

Returns 429 Too Many Requests when exceeded.

---

## Security Features

### Authentication
- **JWT Tokens**: Signed with secret from AWS Secrets Manager
- **HttpOnly Cookies**: Tokens stored in httpOnly cookies (prevents XSS)
- **Secure Flag**: HTTPS only in production
- **SameSite=Lax**: CSRF protection

### Passwords
- **Bcrypt Hashing**: 10 salt rounds
- **Branded Type**: `HashedString` type prevents accidental plain text use
- **Never Logged**: Passwords never written to logs

### Authorization
- **Ownership Verification**: Users can only access their own funds
- **Fund ID Validation**: Check fund exists and belongs to user
- **Balance Checks**: Prevent over-trading

### API Security
- **CORS**: Whitelist specific domains
- **Rate Limiting**: Prevent brute force and DoS
- **Input Validation**: Joi schemas validate all inputs
- **SQL Injection Prevention**: Prisma parameterized queries
- **Secrets Management**: AWS Secrets Manager (not in code)

---

## Common Development Tasks

### Add a New Route

1. Create validation middleware in `src/middleware/request-validation/{feature}/`
2. Create controller in `src/controllers/{feature}/`
3. Create route in `src/routes/{feature}-routes.ts`
4. Mount route in `src/utils/config/setup-routes.ts`
5. Update [routes/CLAUDE.md](src/routes/CLAUDE.md)

### Add a New Background Job

1. Create job function in `src/jobs/{job-name}.ts`
2. Import and call in `src/jobs/start-background-jobs.ts`
3. Add interval constant to `src/utils/constants.ts`
4. Update [jobs/CLAUDE.md](src/jobs/CLAUDE.md)

### Modify Database Schema

1. Edit `prisma/schema.prisma`
2. Create migration: `pnpm exec prisma migrate dev --name <description>`
3. Review generated SQL
4. Update [prisma/CLAUDE.md](prisma/CLAUDE.md) if significant
5. Commit migration file and schema

### Add New Type Definitions

1. Create file in `src/types/` or subdirectory
2. Use `declare global` for global types
3. Export for use across codebase
4. Update [types/CLAUDE.md](src/types/CLAUDE.md)

### Implement New Polymarket Integration

1. Create fetch function in `src/utils/polymarket/`
2. Add API endpoint constants to `src/utils/constants.ts`
3. Use in background jobs or controllers
4. Update [polymarket/CLAUDE.md](src/utils/polymarket/CLAUDE.md)

---

## File Organization Principles

### Naming Conventions

- **Files**: kebab-case (e.g., `user-feedback.ts`)
- **Directories**: kebab-case (e.g., `db-operations`)
- **Classes**: PascalCase (e.g., `SecretsManager`)
- **Functions**: camelCase (e.g., `executeTradeOrder`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `SYNC_INTERVAL_MS`)
- **Types/Interfaces**: PascalCase (e.g., `JwtPayload`)

### Code Organization

- **By Feature**: Routes, controllers grouped by feature (auth, funds, trade)
- **By Operation**: DB operations separated into read/write
- **By Responsibility**: Middleware organized by type (validation, auth, confirm)
- **By Layer**: Clear separation between routes → middleware → controllers → DB

---

## Testing & Validation

### Type Checking
```bash
pnpm run type-check  # TypeScript compilation check
```

### Linting
```bash
pnpm run lint        # ESLint checks
pnpm run lint:fix    # Auto-fix issues
```

### Combined Validation
```bash
pnpm run validate    # Type check + lint
```

### Check Unused Exports
```bash
pnpm run check-unused  # Find unused functions/types
```

---

## Performance Considerations

### Database Queries
- **Minimal field selection**: Only select needed fields
- **Where clause filtering**: Filter at DB level, not in code
- **Indexes**: Used for common lookups
- **Transactions**: Multi-step operations wrapped for consistency

### Caching
- **EventsCache**: In-memory cache of top 1000 events, refreshed every 60 seconds
- **Portfolio Snapshots**: Multiple resolutions allow efficient historical queries

### Rate Limiting
- Prevents API abuse
- Protects against brute force attacks
- Allows legitimate trading volume

### Background Jobs
- Scheduled to avoid thundering herd
- Market sync offset from resolution sync (stagger load)
- Portfolio snapshots run every minute but at multiple resolutions

---

