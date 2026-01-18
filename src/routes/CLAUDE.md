# Routes Directory

This directory contains Express route definitions for the Wiretap API. Routes are organized by domain/feature and mounted with middleware in the central route setup utility.

## Structure

```
routes/
├── auth-routes.ts              # User authentication endpoints
├── events-routes.ts            # Polymarket events endpoints
├── funds-routes.ts             # Fund/portfolio management endpoints
├── trade-routes.ts             # Buy/sell trading endpoints
├── personal-info-routes.ts      # User account info and settings
├── misc-routes.ts              # Miscellaneous endpoints (feedback, etc.)
└── internal-routes.ts          # Internal/admin endpoints (mostly unused)
```

## Route Organization Pattern

All routes follow this structure:
1. Import Express Router
2. Import validation middleware
3. Import controller functions
4. Create router with `express.Router()`
5. Define routes with middleware chain
6. Export router as default

**Middleware chain order**:
```
Route → Validation → Confirmation → Rate Limiting → JWT Auth → Controller
```

---

## Route Groups

### Auth Routes (/auth)
**Rate limiter**: `authRateLimiter`
**Authentication**: No JWT required (these are for logging in)

| Method | Endpoint | Validation | Controller | Purpose |
|--------|----------|-----------|-----------|---------|
| POST | /login | `validateLogin` | `login` | Email/password login |
| POST | /register | `validateRegister` | `register` | Create new account |
| POST | /logout | None | `logout` | Logout user |
| POST | /google-auth/login-callback | `validateGoogleLoginAuthCallback` | `googleLoginAuthCallback` | Google OAuth callback |

**Key features**:
- Two login methods: traditional email/password and Google OAuth
- No JWT requirement (these establish authentication)
- Highest rate limit (these are public endpoints)

---

### Events Routes (/events)
**Rate limiter**: `eventsRateLimiter`
**Authentication**: No JWT required
**Purpose**: Browse Polymarket events and market data

| Method | Endpoint | Validation/Middleware | Controller | Purpose |
|--------|----------|-----------|-----------|---------|
| GET | /all-events | `validateOffsetQueryParam` | `getAllEvents` | List all events with pagination |
| GET | /single-event/:eventSlug | `validateEventIdInParams`, `attachEventIdFromEventSlug` | `getSingleEvent` | Get detailed event data |

**Middleware notes**:
- `validateOffsetQueryParam`: Validates pagination offset
- `attachEventIdFromEventSlug`: Converts slug to event ID for lookup
- Events are public data (no authentication required)

---

### Trade Routes (/trade)
**Rate limiter**: `tradingRateLimiter`
**Authentication**: `jwtVerifyAttachUserId` (required)
**Purpose**: Buy and sell market positions

| Method | Endpoint | Middleware Chain | Controller | Purpose |
|--------|----------|-----------|-----------|---------|
| POST | /buy/:wiretapFundUuid | Validate params → Confirm fund exists → Validate order → Fetch price → Confirm funds | `buyShares` | Purchase shares in an outcome |
| POST | /sell/:wiretapFundUuid | Validate params → Confirm fund exists → Validate order → Fetch price → Confirm shares | `sellShares` | Sell shares from a position |

**Buy route validation chain**:
1. `validateWiretapFundUuidInParams`: UUID format validation
2. `validateBuyShares`: Order amount validation
3. `confirmWiretapFundIdExistsAndValidId`: Fund ownership verification
4. `validateOutcomeValid`: Outcome ID validation
5. `validateBuyOrderAndFetchPrice`: Price and order validity
6. `confirmUserHasSufficientFundsToPurchaseShares`: Cash balance check
7. `buyShares`: Execute trade

**Sell route validation chain**:
1. `validateWiretapFundUuidInParams`: UUID format validation
2. `validateSellShares`: Order amount validation
3. `confirmWiretapFundIdExistsAndValidId`: Fund ownership verification
4. `validateOutcomeValid`: Outcome ID validation
5. `validateSellOrderAndFetchPrice`: Price and order validity
6. `confirmWiretapBrokerageHasSufficientShares`: Position balance check
7. `sellShares`: Execute trade

**Key features**:
- Extensive validation before execution (fail-safe)
- Price fetching in middleware to ensure current prices
- Balance/position confirmation prevents over-trading
- JWT required (authenticated trading only)

---

### Funds Routes (/funds)
**Rate limiter**: `tradingRateLimiter`
**Authentication**: `jwtVerifyAttachUserId` (required)
**Purpose**: Manage fund portfolios and view holdings

| Method | Endpoint | Middleware | Controller | Purpose |
|--------|----------|-----------|-----------|---------|
| GET | /all-my-funds | None | `getMyFunds` | List all user's funds |
| GET | /detailed-fund/:wiretapFundUuid | Validate UUID, Confirm exists | `getDetailedFund` | Get fund details and holdings |
| POST | /portfolio-history-by-resolution/:wiretapFundUuid | Validate UUID, Validate resolution, Confirm exists | `getPortfolioHistoryByResolution` | Get historical portfolio snapshots |
| POST | /create-fund | `validateCreateFundRequest` | `createFund` | Create new fund |
| POST | /set-primary-fund/:wiretapFundUuid | Validate UUID, Confirm exists | `setPrimaryFund` | Set default fund |

**Key features**:
- Detailed fund view includes current holdings
- Portfolio history supports multiple time resolutions
- Creation and management of multiple funds per user
- All operations require JWT authentication

---

### Personal Info Routes (/personal-info)
**Rate limiter**: `generalRateLimiter`
**Authentication**: `jwtVerifyAttachUser` (required)
**Purpose**: User account management

| Method | Endpoint | Middleware | Controller | Purpose |
|--------|----------|-----------|-----------|---------|
| GET | /personal-info | JWT verify, Rate limit | `getPersonalInfo` | Get logged-in user's profile |
| POST | /change-password | Validate request, JWT verify, Rate limit | `setNewPassword` | Update account password |

**Key features**:
- Password change requires validation and rate limiting
- Retrieves authenticated user's info via JWT
- Protected by rate limiting

---

### Misc Routes (/misc)
**Rate limiter**: `generalRateLimiter`
**Purpose**: Miscellaneous functionality (user feedback, etc.)

| Method | Endpoint | Middleware | Controller | Purpose |
|--------|----------|-----------|-----------|---------|
| POST | /user-feedback | Validate feedback, JWT verify, Rate limit | `addUserFeedback` | Submit user feedback |

**Key features**:
- User feedback submission for product improvement
- Rate limited to prevent spam
- Requires authentication

---

### Internal Routes (/internal)
**Purpose**: Internal/admin operations
**Status**: Currently unused (routes commented out)

Placeholder for future internal operations like bulk email campaigns.

---

## Route Setup and Mounting

Routes are mounted in `src/utils/config/setup-routes.ts`:

```typescript
app.use("/auth", authRateLimiter, authRoutes)
app.use("/events", eventsRateLimiter, eventsRoutes)
app.use("/personal-info", personalInfoRoutes)
app.use("/trade", jwtVerifyAttachUserId, tradingRateLimiter, tradeRoutes)
app.use("/funds", jwtVerifyAttachUserId, tradingRateLimiter, fundsRoutes)
app.use("/internal", internalRoutes)
app.use("/health", checkHealth)
app.use("/misc", miscRoutes)
```

### Mounting Middleware

Global middleware applied at mount time:
- **Auth routes**: `authRateLimiter` (high limit for public signup/login)
- **Events routes**: `eventsRateLimiter` (moderate limit for public browsing)
- **Trade routes**: `jwtVerifyAttachUserId` + `tradingRateLimiter` (strict limit, auth required)
- **Funds routes**: `jwtVerifyAttachUserId` + `tradingRateLimiter` (strict limit, auth required)
- **Personal info**: Route-specific JWT verification + rate limiting
- **Misc routes**: Route-specific JWT verification + rate limiting
- **Health check**: Direct controller (no middleware)

---

## Middleware Architecture

### Three Middleware Types

**1. Validation Middleware**
- Validates request data format and constraints
- Runs early in chain
- Examples: `validateLogin`, `validateBuyShares`

**2. Confirmation Middleware**
- Verifies ownership, existence, balance
- Runs after validation
- Examples: `confirmWiretapFundIdExistsAndValidId`, `confirmUserHasSufficientFundsToPurchaseShares`

**3. Authentication/Rate Limiting**
- JWT verification and rate limiting
- Typically mounted at group level
- Prevents unauthorized access and abuse

### Middleware Chain Execution
Middleware executes in the order defined. Each middleware can:
- Attach data to `req` for downstream use
- Validate and reject with error response
- Call `next()` to continue chain
- Be skipped conditionally

---

## Authentication Strategy

### JWT-Protected Routes

Routes requiring `jwtVerifyAttachUserId`:
- `/trade/*` - All trading operations
- `/funds/*` - All fund management
- `/personal-info/*` - User account operations
- `/misc/*` - User feedback

Routes NOT requiring JWT:
- `/auth/*` - Authentication endpoints
- `/events/*` - Public event browsing

### JWT Attachment

`jwtVerifyAttachUserId` middleware:
- Extracts JWT from Authorization header
- Verifies token signature
- Attaches user ID to `req.userId`
- Rejects if invalid/missing

---

## Rate Limiting Strategy

**Three rate limit levels**:

1. **authRateLimiter**: Public signup/login (permissive)
2. **eventsRateLimiter**: Public browsing (moderate)
3. **tradingRateLimiter**: Protected endpoints (strict - prevents API abuse)
4. **generalRateLimiter**: User account operations (moderate)

Rate limiters prevent:
- Brute force login attacks
- API resource exhaustion
- Trading operation spam

---

## Error Handling

### Validation Errors
Validation middleware returns structured error responses:
```json
{
  "error": "Invalid field: xyz",
  "details": { /* field-specific errors */ }
}
```

### Confirmation Errors
Confirmation middleware returns:
```json
{
  "error": "Fund does not exist or user has no access"
}
```

### Controller Errors
Controllers handle business logic errors and return appropriate status codes.

---

## When Adding New Routes

1. **Create route file** (e.g., `features-routes.ts`)
   - Follow existing pattern: imports → router → endpoint definitions → export

2. **Define endpoints** with appropriate middleware:
   ```typescript
   router.post(
     "/path/:param",
     validateInput,
     confirmOwnership,
     controllerFunction
   )
   ```

3. **Mount in setup-routes.ts**:
   ```typescript
   app.use("/features", jwtVerifyAttachUserId, rateLimiter, featureRoutes)
   ```

4. **Document in CLAUDE.md**:
   - Add route group section
   - List endpoints with methods, paths, middleware
   - Explain validation chain
   - Note authentication requirements

5. **Create corresponding:**
   - Controllers in `../controllers/`
   - Validation middleware in `../middleware/request-validation/`
   - Confirmation middleware in `../middleware/confirm/`

---

## Related Files
- `src/controllers/` - Endpoint handler functions
- `src/middleware/` - Request validation, JWT, rate limiting
- `src/utils/config/setup-routes.ts` - Route mounting configuration
- `src/index.ts` - Server startup (calls setupRoutes)
