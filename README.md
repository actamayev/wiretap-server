# Wiretap Server

A TypeScript-based Node.js backend API for the Wiretap prediction market trading platform. Wiretap enables users to create trading accounts, browse Polymarket prediction markets, and buy/sell shares in market outcomes.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Database](#database)
- [API Endpoints](#api-endpoints)
- [Background Jobs](#background-jobs)
- [Deployment](#deployment)
- [Documentation](#documentation)

## Overview

Wiretap Server is a REST API that connects users to Polymarket's prediction markets. The platform allows users to:

- **Create accounts** with email/password or Google OAuth
- **Manage portfolios**: Create multiple trading funds with tracked cash balances
- **Trade prediction markets**: Buy and sell shares in Polymarket outcomes
- **Track performance**: Historical portfolio snapshots at multiple time resolutions
- **Monitor markets**: Browse events and markets synced from Polymarket's GAMMA API
- **Submit feedback**: Contribute to product development

### Technology Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js with TypeScript |
| Framework | Express.js 5.x |
| Database | PostgreSQL with Prisma ORM |
| Authentication | JWT + Google OAuth |
| Secrets | AWS Secrets Manager |
| Email | Resend |
| HTTP Client | Axios |
| Validation | Joi |
| Password Hashing | bcrypt |
| Rate Limiting | express-rate-limit |

## Getting Started

### Prerequisites

- Node.js (v20+)
- pnpm (package manager)
- PostgreSQL database
- AWS account with Secrets Manager (production)

### Installation

1. **Clone and navigate to project**
```bash
cd wiretap-server
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables** (.env.local for development)
```bash
cp .env.sample .env.local
```

4. **Configure database**
```bash
# Create PostgreSQL database
createdb wiretap

# Run migrations
pnpm exec prisma migrate dev
```

5. **Generate Prisma client**
```bash
pnpm exec prisma generate
```

6. **Start development server**
```bash
pnpm run dev
```

Server runs on `http://localhost:8080`

### Environment Variables

**Development (.env.local)**:
```
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/wiretap
JWT_KEY=<local-secret-key>
RESEND_API_KEY=<test-key>
GOOGLE_CLIENT_ID=<oauth-client-id>
GOOGLE_CLIENT_SECRET=<oauth-secret>
AWS_ACCESS_KEY_ID=<aws-key>
AWS_SECRET_ACCESS_KEY=<aws-secret>
```

**Production**: All secrets retrieved from AWS Secrets Manager. Set `NODE_ENV=production` to enable production mode.

## Project Structure

```
wiretap-server/
├── src/
│   ├── types/                          # Type definitions
│   │   └── *.ts                        # Global and domain-specific types
│   ├── classes/                        # Utility classes
│   │   ├── singleton.ts               # Base Singleton class
│   │   ├── hash.ts                    # Password hashing (bcrypt)
│   │   ├── prisma-client.ts           # Prisma client initialization
│   │   ├── events-cache.ts            # In-memory events cache
│   │   └── aws/
│   │       └── secrets-manager.ts     # AWS Secrets Manager integration
│   ├── jobs/                           # Background jobs
│   │   ├── start-background-jobs.ts   # Job orchestration
│   │   ├── sync-market.ts             # Sync markets from Polymarket
│   │   ├── sync-market-resolution.ts  # Track market closures
│   │   ├── calculate-portfolio-snapshots.ts  # Record portfolio values
│   │   └── cleanup-old-snapshots.ts   # Delete old snapshots
│   ├── routes/                         # API route definitions
│   │   ├── auth-routes.ts             # Authentication endpoints
│   │   ├── events-routes.ts           # Event browsing
│   │   ├── trade-routes.ts            # Buy/sell trading
│   │   ├── funds-routes.ts            # Portfolio management
│   │   ├── personal-info-routes.ts    # User account settings
│   │   ├── misc-routes.ts             # Feedback, etc.
│   │   └── internal-routes.ts         # Internal operations
│   ├── controllers/                    # Route handlers
│   │   ├── auth/                      # Auth controllers
│   │   ├── events/                    # Events controllers
│   │   ├── trade/                     # Trading controllers
│   │   ├── funds/                     # Fund controllers
│   │   ├── personal-info/             # User controllers
│   │   ├── misc/                      # Misc controllers
│   │   └── health-checks/             # Health check
│   ├── middleware/                     # Express middleware
│   │   ├── init-config.ts             # Global middleware (CORS, JSON, cookies)
│   │   ├── rate-limiters.ts           # Rate limiting
│   │   ├── cookie-helpers.ts          # Auth cookie management
│   │   ├── jwt/                       # JWT verification middleware
│   │   ├── attach/                    # Data attachment middleware
│   │   ├── confirm/                   # Authorization checks
│   │   └── request-validation/        # Request validation with Joi
│   ├── db-operations/                  # Database operations
│   │   ├── read/                      # Read-only queries
│   │   │   ├── credentials/           # User lookups
│   │   │   ├── find/                  # Find operations
│   │   │   ├── wiretap-fund/          # Fund queries
│   │   │   ├── position/              # Position queries
│   │   │   ├── polymarket-event/      # Event queries
│   │   │   ├── polymarket-outcome/    # Outcome queries
│   │   │   └── portfolio-snapshot/    # Snapshot queries
│   │   └── write/                     # Write operations
│   │       ├── credentials/           # User creation
│   │       ├── polymarket-event/      # Event upserts
│   │       ├── polymarket-market/     # Market upserts
│   │       ├── polymarket-outcome/    # Outcome upserts
│   │       ├── wiretap-fund/          # Fund creation
│   │       ├── portfolio-snapshot/    # Snapshot creation
│   │       └── simultaneous-writes/   # Complex transactions
│   ├── utils/                          # Utility functions
│   │   ├── auth-helpers/              # JWT signing/verification
│   │   ├── config/                    # App configuration
│   │   ├── emails/                    # Email sending
│   │   ├── google/                    # Google OAuth setup
│   │   ├── polymarket/                # Polymarket API clients
│   │   └── constants.ts               # Constants (intervals, URLs, batch sizes)
│   ├── generated/                      # Generated files (Prisma client)
│   └── index.ts                        # Application entry point
├── prisma/
│   ├── schema.prisma                  # Database schema definition
│   └── migrations/                     # Migration history
├── emails/                             # Email templates (React)
├── sql/                                # SQL utilities
├── package.json                        # Dependencies and scripts
├── tsconfig.json                       # TypeScript configuration
├── eslint.config.mjs                  # Linting rules
├── ecosystem.config.js                 # PM2 configuration
├── CLAUDE.md                           # Global project documentation
└── README.md                           # This file
```

### Directory Documentation

Each major directory has detailed documentation in its CLAUDE.md file:

| Directory | Documentation |
|-----------|---|
| `src/types/` | [CLAUDE.md](src/types/CLAUDE.md) - Type system design |
| `src/classes/` | [CLAUDE.md](src/classes/CLAUDE.md) - Utility classes (Singleton, Hash, Prisma, Cache, Secrets) |
| `src/jobs/` | [CLAUDE.md](src/jobs/CLAUDE.md) - Background job scheduling and design |
| `src/routes/` | [CLAUDE.md](src/routes/CLAUDE.md) - API endpoint definitions |
| `src/db-operations/read/` | [CLAUDE.md](src/db-operations/read/CLAUDE.md) - Read operation patterns |
| `src/db-operations/write/` | [CLAUDE.md](src/db-operations/write/CLAUDE.md) - Write operation patterns |
| `src/middleware/` | [CLAUDE.md](src/middleware/CLAUDE.md) - Middleware architecture |
| `src/utils/` | [CLAUDE.md](src/utils/auth-helpers/CLAUDE.md), [config](src/utils/config/CLAUDE.md), [emails](src/utils/emails/CLAUDE.md), [google](src/utils/google/CLAUDE.md), [polymarket](src/utils/polymarket/CLAUDE.md) |
| `prisma/` | [CLAUDE.md](prisma/CLAUDE.md) - Database schema and migrations |
| **Project Root** | [CLAUDE.md](CLAUDE.md) - Architecture overview and quick reference |

## Development

### Available Scripts

```bash
# Start development server (auto-reload)
pnpm run dev

# Build TypeScript to JavaScript
pnpm run build

# Production build
pnpm run build:prod

# Type checking
pnpm run type-check

# Linting
pnpm run lint
pnpm run lint:fix

# Validation (type check + lint)
pnpm run validate

# Check for unused exports
pnpm run check-unused

# Start with PM2
pnpm run start

# Deploy (production)
pnpm run deploy
```

### Code Quality

The project maintains high code quality through:

- **TypeScript**: Strict type checking
- **ESLint**: Code style enforcement
- **Type Validation**: Pre-commit type checking
- **Request Validation**: Joi schemas for all inputs

Run validation before committing:
```bash
pnpm run validate
```

## Database

### Schema Overview

The database consists of these main entity groups:

**User Management**:
- `credentials` - User accounts (email, password, auth method)
- `login_history` - Login event tracking
- `user_feedback` - User feedback submissions
- `email_update_subscriber` - Marketing subscribers

**Portfolio Management**:
- `wiretap_fund` - User trading accounts with cash balance
- `position` - Current holdings in outcomes
- `purchase_order` - Buy transaction records (immutable)
- `sale_order` - Sell transaction records with P&L (immutable)
- `portfolio_snapshot` - Historical portfolio values

**Market Data**:
- `polymarket_event` - Events synced from Polymarket GAMMA API
- `polymarket_market` - Individual markets within events
- `polymarket_outcome` - Market outcomes (Yes/No, etc.)

### Key Design Patterns

**Immutable Transactions**: Purchase and sale orders are immutable (never updated after creation) to preserve audit trail.

**Multiple Portfolio Snapshots**: Records snapshots at multiple time resolutions (1, 5, 30, 180 minutes) for efficient charting without excessive storage.

**Soft Deletes**: Users are marked inactive (`is_active = false`) rather than deleted to preserve transaction history.

**UUID Funds**: Fund identifiers use UUIDs (not sequential IDs) for safer external API exposure.

### Migrations

Migrations are managed with Prisma and stored in `prisma/migrations/`. To make schema changes:

```bash
# Edit prisma/schema.prisma
# Then create and apply migration
pnpm exec prisma migrate dev --name <description>

# In production
pnpm exec prisma migrate deploy
```

### Database Queries

All database access goes through `src/db-operations/`:
- **read/**: SELECT queries for retrieving data
- **write/**: INSERT, UPDATE, DELETE operations including complex transactions

Database operations use Prisma ORM for type-safe queries and automatic SQL generation.

## API Endpoints

### Authentication

```
POST   /auth/login                          Login with email/password
POST   /auth/register                       Create new account
POST   /auth/logout                         Logout
POST   /auth/google-auth/login-callback     Google OAuth callback
```

### Events (Public)

```
GET    /events/all-events?offset=0          List all events (paginated)
GET    /events/single-event/:eventSlug      Get event details
```

### Trading (Protected)

```
POST   /trade/buy/:wiretapFundUuid          Buy shares
POST   /trade/sell/:wiretapFundUuid         Sell shares
```

### Funds (Protected)

```
GET    /funds/all-my-funds                  List user's funds
GET    /funds/detailed-fund/:wiretapFundUuid Get fund with holdings
POST   /funds/create-fund                   Create new fund
POST   /funds/set-primary-fund/:wiretapFundUuid Set default fund
POST   /funds/portfolio-history-by-resolution/:wiretapFundUuid Get historical snapshots
```

### User Account (Protected)

```
GET    /personal-info/personal-info         Get user profile
POST   /personal-info/change-password       Change password
```

### Miscellaneous (Protected)

```
POST   /misc/user-feedback                  Submit feedback
```

### Health

```
GET    /health                              Health check
```

### Rate Limiting

Endpoints have tiered rate limits:

| Endpoint | Limit | Window | Per |
|----------|-------|--------|-----|
| /auth/* | 20 requests | 5 minutes | IP |
| /events/* | 45 requests | 1 minute | IP |
| /trade/* | 100 requests | 1 minute | User |
| /funds/* | 100 requests | 1 minute | User |
| Other | 45 requests | 1 minute | User/IP |

Exceeding limits returns `429 Too Many Requests`.

## Background Jobs

Background jobs run continuously to sync data and maintain portfolio state.

### Job Schedule

| Job | Interval | Purpose |
|-----|----------|---------|
| Market Sync | Every 5 minutes | Fetch latest events and markets from Polymarket |
| Resolution Sync | Every 5 minutes (offset +2.5min) | Check for closed markets and update winners |
| Portfolio Snapshots | Every 1 minute | Record fund values at multiple resolutions |
| Snapshot Cleanup | Every 1 hour | Delete old snapshots based on retention rules |
| Events Cache Refresh | Every 1 minute | Refresh in-memory cache of top events |

### Market Sync

Fetches up to 1000 active events from Polymarket's GAMMA API and upserts:
- Events: Title, description, status, volume, URLs
- Markets: Individual tradeable markets within events
- Outcomes: Yes/No outcomes with CLOB token IDs

Runs idempotently (safe to run multiple times) using Prisma upsert operations.

### Resolution Sync

Checks for closed markets and updates:
- Event status when closed
- Market status when closed
- Winning outcome when resolved (price = 1.0)

Handles batch operations with rate-limit delays to avoid overwhelming Polymarket API.

### Portfolio Snapshots

Records fund portfolio values at multiple time resolutions:
- **1-minute**: Detailed tracking (kept 1 hour)
- **5-minute**: Standard resolution (kept 1 day)
- **30-minute**: Daily analysis (kept 1 week)
- **180-minute** (3 hours): Weekly trends (kept 1 month)

Used for charting portfolio performance over time.

### Cleanup

Deletes old snapshots based on retention rules to control database size while preserving sufficient history for analytics.

## Security

### Authentication & Authorization

- **JWT Tokens**: Signed with secrets from AWS Secrets Manager
- **HttpOnly Cookies**: Tokens stored securely (prevents XSS access)
- **Ownership Checks**: Users can only access their own funds
- **Fund Validation**: Funds verified to exist and belong to user

### Password Security

- **Bcrypt Hashing**: 10 salt rounds
- **Never Logged**: Passwords never written to logs
- **Type Safety**: Branded `HashedString` type prevents accidental plain text use

### API Security

- **CORS**: Whitelist specific domains only
- **Rate Limiting**: Prevents brute force and DoS attacks
- **Input Validation**: Joi schemas validate all request data
- **Parameterized Queries**: Prisma prevents SQL injection
- **Secrets Management**: AWS Secrets Manager (not stored in code)

### CORS Configuration

| Environment | Allowed Origins |
|---|---|
| Production | https://wiretap.pro, https://www.wiretap.pro |
| Staging | All Vercel preview URLs (*.vercel.app) |
| Development | http://localhost:3000 |

## Deployment

### Build Process

```bash
# Type check and build
pnpm run build

# Generates: dist/index.js
```

### Running in Production

Uses PM2 process manager (see `ecosystem.config.js`):

```bash
# Start
pm2 start ecosystem.config.js

# View logs
pm2 logs

# Restart
pm2 restart wiretap-server

# Stop
pm2 stop wiretap-server
```

### Environment

Production environment must have:
- PostgreSQL database configured
- AWS Secrets Manager with keys: DATABASE_URL, JWT_KEY, RESEND_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- NODE_ENV=production
- PM2 process manager

## Documentation

Comprehensive documentation is provided in:

- **[CLAUDE.md](CLAUDE.md)** - Global project documentation, architecture overview, quick reference
- **Directory-specific CLAUDE.md files** - Detailed documentation for each major component
- **Code comments** - JSDoc comments on complex functions
- **Type definitions** - Types document expected data structures

For detailed information on any component, see its CLAUDE.md file in the directory structure table above.

## Troubleshooting

### Database Connection Issues

```bash
# Check connection string
echo $DATABASE_URL

# Test connection
pnpm exec prisma db push --skip-generate
```

### JWT Errors

Check that JWT_KEY is set in AWS Secrets Manager (production) or .env.local (development).

### Rate Limiting

Rate limit headers are returned with responses:
- `RateLimit-Limit`: Maximum requests
- `RateLimit-Remaining`: Requests remaining
- `RateLimit-Reset`: Time when limit resets

### Polymarket API Errors

Check that GAMMA_BASE_URL and CLOB_BASE_URL are accessible. Market sync failures are logged but don't stop other jobs.

## Contributing

When making changes:

1. **Type Check**: `pnpm run type-check`
2. **Lint**: `pnpm run lint:fix`
3. **Validate**: `pnpm run validate`
4. **Test Changes**: Run affected code paths
5. **Update Documentation**: Modify relevant CLAUDE.md files if making architectural changes

## License

See LICENSE file in project root.

## Support

For questions about the codebase:

1. Check relevant CLAUDE.md documentation
2. Review code comments and type definitions
3. Check git history for context on specific files
4. Examine related library documentation
