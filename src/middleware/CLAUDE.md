# Middleware Directory

This directory contains all Express middleware functions for request processing, validation, authentication, and authorization. Middleware is organized by responsibility and executed in sequence through the request pipeline.

## Structure

```
middleware/
├── init-config.ts                           # Global app middleware configuration (CORS, JSON, cookies)
├── cookie-helpers.ts                        # Auth cookie management utilities
├── rate-limiters.ts                         # Rate limiting for different endpoint types
├── jwt/                                     # JWT token verification middleware
│   ├── jwt-verify-attach-user-id.ts         # Lightweight: attach user ID only
│   └── jwt-verify-attach-user.ts            # Full: attach user object and ID
├── attach/                                  # Data attachment middleware
│   └── attach-event-id-from-event-slug.ts   # Convert slug to event ID
├── confirm/                                 # Authorization and ownership verification
│   ├── confirm-wiretap-fund-id-exists-and-valid-id.ts
│   ├── confirm-wiretap-brokerage-has-sufficient-funds.ts
│   └── confirm-wiretap-brokerage-has-sufficient-shares.ts
├── request-validation/                      # Request body/param validation with Joi
│   ├── auth/                                # Auth endpoint validation
│   ├── events/                              # Events endpoint validation
│   ├── funds/                               # Funds endpoint validation
│   ├── trade/                               # Trading endpoint validation
│   ├── personal-info/                       # User account validation
│   ├── misc/                                # Miscellaneous validation
│   └── validate-wiretap-brokerage-account-id-in-params.ts
└── joi/                                     # Reusable Joi validation schemas
    ├── email-validator.ts                   # Email validation schema
    └── password-validator.ts                # Password validation schema
```

## Middleware Execution Flow

### Request Pipeline

```
Request
  ↓
[Global Middleware: CORS, JSON Parser, Cookie Parser]
  ↓
[Route-Group Middleware: Rate Limiting, JWT Auth]
  ↓
[Route-Level Middleware Chain]
  ├─ [1] Validation: Request format and constraints
  ├─ [2] Attachment: Enrich request with data
  ├─ [3] Confirmation: Authorization and business logic checks
  ↓
[Controller Handler]
  ↓
Response
```

### Example: Trading Endpoint
```
POST /trade/buy/:wiretapFundUuid
  ↓ tradingRateLimiter (100 req/min per user)
  ↓ jwtVerifyAttachUserId (verify token, attach req.userId)
  ↓ validateBuyShares (validate body: clobToken, valueOfSharesPurchasing)
  ↓ confirmWiretapFundIdExistsAndValidId (fund exists & owned by user)
  ↓ validateOutcomeValid (outcome ID valid)
  ↓ validateBuyOrderAndFetchPrice (fetch current price, validate total cost)
  ↓ confirmUserHasSufficientFundsToPurchaseShares (cash check)
  ↓ buyShares (controller - execute trade)
```

---

## Core Middleware

### Global Middleware (init-config.ts)

Applied to all requests. Configured in `src/index.ts`.

**CORS Configuration**:
- **Production**: `https://wiretap.pro`, `https://www.wiretap.pro`
- **Staging**: All Vercel preview URLs (*.vercel.app)
- **Development**: `http://localhost:3000`
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Credentials**: Enabled (cookies supported)

**Other Global Middleware**:
```typescript
app.use(cors(corsOptions))      // CORS handling
app.use(cookieParser())         // Parse cookies
app.use(express.json())         // Parse JSON body
```

---

### Rate Limiting (rate-limiters.ts)

Prevents API abuse by limiting requests per window.

#### Auth Rate Limiter
- **Window**: 5 minutes
- **Limit**: 20 requests per 5 minutes
- **Key**: By IP address
- **Purpose**: Prevent brute force login attempts
- **Used by**: `/auth/*` endpoints

#### Events Rate Limiter
- **Window**: 1 minute
- **Limit**: 45 requests per minute
- **Key**: By IP address
- **Purpose**: Prevent API scraping
- **Used by**: `/events/*` endpoints

#### General Rate Limiter
- **Window**: 1 minute
- **Limit**: 45 requests per minute
- **Key**: By user ID (or IP if not authenticated)
- **Purpose**: General API rate limiting
- **Used by**: `/personal-info/*`, `/misc/*` endpoints

#### Trading Rate Limiter
- **Window**: 1 minute
- **Limit**: 100 requests per minute per user
- **Key**: By user ID
- **Purpose**: Prevent order spam while allowing legitimate trading volume
- **Used by**: `/trade/*`, `/funds/*` endpoints

**Key Generation**:
```typescript
keyGenerator: (req) => {
  return req.userId?.toString() || ipKeyGenerator(req.ip!)
}
```
Prefers user ID for authenticated users, falls back to IP for anonymous.

**Error Response**:
```json
{
  "error": "Too many requests"
}
// Status: 429 Too Many Requests
```

---

### Cookie Management (cookie-helpers.ts)

Secure cookie handling for JWT tokens.

#### setAuthCookie(res, token)
Sets authentication cookie with secure options:
- **httpOnly**: `true` (prevent XSS access)
- **secure**: `true` in production (HTTPS only)
- **sameSite**: `lax` (prevent CSRF)
- **domain**: `.wiretap.pro` in production (subdomain sharing)
- **maxAge**: 30 days

```typescript
setAuthCookie(res, token)  // Called after login
```

#### clearAuthCookie(res)
Clears authentication cookie on logout:
```typescript
clearAuthCookie(res)  // Called on logout
```

#### getAuthTokenFromCookies(req)
Retrieves token from request cookies:
```typescript
const token = getAuthTokenFromCookies(req)  // Used by JWT middleware
```

---

## Authentication Middleware

### JWT: Attach User ID Only (jwt-verify-attach-user-id.ts)

Lightweight JWT verification. Attaches only user ID to request.

**Process**:
1. Extract token from cookies
2. Verify token signature with `getDecodedId()`
3. Attach `req.userId = userId`
4. Call `next()`

**On Error**: Return 401 Unauthorized

**Use case**: Rate limiting, basic authorization checks

**Attached**: `req.userId: number`

```typescript
// In middleware chain
jwtVerifyAttachUserId,

// In controller
const userId = req.userId  // Available
```

---

### JWT: Attach Full User (jwt-verify-attach-user.ts)

Full JWT verification. Attaches user object and ID.

**Process**:
1. Extract token from cookies
2. Validate cookie structure with Joi
3. Verify token signature with `getDecodedId()`
4. Fetch full user with `findUserById()`
5. Verify user exists and is active
6. Attach `req.user` and `req.userId`
7. Call `next()`

**On Error**: Return 401 Unauthorized

**Use case**: Accessing user data (email, auth method)

**Attached**:
- `req.user: ExtendedCredentials` (full user object)
- `req.userId: number` (for rate limiting)

```typescript
// In middleware chain
jwtVerifyAttachUser,

// In controller
const user = req.user  // Full credentials object
const email = req.user.email
```

---

## Data Attachment Middleware

### attach-event-id-from-event-slug.ts

Converts event slug (URL-friendly) to event ID (database).

**Input**: `req.params.eventSlug` (e.g., "bitcoin-to-100k-by-eoy")

**Process**:
1. Extract slug from route params
2. Query database: `retrieveEventIdFromEventSlug(slug)`
3. Attach `req.eventId = eventId`
4. Call `next()`

**On Error**: Return 500 Internal Server Error

**Attached**: `req.eventId: EventId`

```typescript
// Route
app.get("/events/single-event/:eventSlug", attachEventIdFromEventSlug, getSingleEvent)

// Middleware
req.eventId = "12345"

// Controller
const event = await getEventById(req.eventId)
```

---

## Authorization Middleware (confirm/)

Verify ownership, existence, and business logic constraints.

### confirm-wiretap-fund-id-exists-and-valid-id.ts

Verify fund exists and user owns it.

**Process**:
1. Extract fund UUID from `req.params.wiretapFundUuid`
2. Get user ID from `req.userId` (from JWT middleware)
3. Query database: `retrieveUserIdFromBrokerageId(fundUuid)`
4. Check fund exists (not undefined)
5. Check user owns fund (IDs match)
6. Call `next()` if all checks pass

**Errors**:
- Fund doesn't exist → 400 Bad Request
- User doesn't own fund → 400 Bad Request
- Database error → 500 Internal Server Error

**Prevents**:
- Unauthorized access to other users' funds
- Operations on non-existent funds

---

### confirm-wiretap-brokerage-has-sufficient-funds.ts

Verify user has enough cash to buy shares.

**Process**:
1. Extract order details from `req.validatedBuyOrder` (from validation middleware)
   - `wiretapFundUuid`
   - `numberOfSharesPurchasing`
   - `currentPrice`
2. Calculate total cost: `currentPrice × numberOfSharesPurchasing`
3. Query database: `retrieveCurrentAccountBalance(fundUuid)`
4. Compare: `balance >= totalCost`
5. Call `next()` if sufficient funds

**Errors**:
- Fund not found → 500 Internal Server Error
- Insufficient funds → 400 Bad Request with balance details

**Prevents**:
- Over-trading (buying without cash)

---

### confirm-wiretap-brokerage-has-sufficient-shares.ts

Verify user owns enough shares to sell.

**Pattern**: Similar to funds check but verifies position balance instead.

---

## Request Validation Middleware

Validates request format, types, and constraints using Joi schemas.

### Pattern

```typescript
import Joi from "joi"

const schemaName = Joi.object({
  fieldName: Joi.type().constraint(),
}).required().unknown(false)

export default function validateMiddleware(req, res, next) {
  const { error } = schemaName.validate(req.body)

  if (error) {
    return res.status(400).json({ validationError: error.details[0].message })
  }

  // Optionally transform validated data
  req.validatedData = req.body

  next()
}
```

### Common Validations

**Email Validation** (joi/email-validator.ts):
```typescript
const emailValidator = Joi.string().custom((value, helpers) => {
  if (!validator.isEmail(value)) {
    return helpers.error("string.invalidEmail")
  }
  return value
})
```
- Uses `validator.isEmail()` for RFC compliance
- Custom error message

**Password Validation** (joi/password-validator.ts):
- Reusable schema for password requirements

### Auth Validation (request-validation/auth/)

#### validate-login.ts
- Validates login credentials
- **Fields**: `loginInformation.email`, `loginInformation.password`
- **Trims** email before passing to controller

#### validate-register.ts
- Validates registration data
- **Fields**: Email, password, password confirmation
- **Checks**: Email format, password strength

#### validate-google-login-auth-callback.ts
- Validates Google OAuth response
- **Fields**: Google auth code/token

### Trade Validation (request-validation/trade/)

#### validate-buy-shares.ts
- **Fields**: `clobToken`, `valueOfSharesPurchasing`
- **Constraints**: clobToken required, shares positive integer
- **Stores in**: `req.validatedBuyOrder` for confirmation middleware

#### validate-sell-shares.ts
- **Fields**: `clobToken`, `numberOfSharesToSell`
- **Constraints**: clobToken required, shares positive integer

#### validate-buy-order-and-fetch-price.ts
- **Purpose**: Multi-step validation AND data fetching
- **Steps**:
  1. Validate outcome exists
  2. Fetch current price from CLOB API
  3. Store price in `req.validatedBuyOrder` for confirmation checks

#### validate-outcome-valid.ts
- Verify outcome (Yes/No) is valid for market
- Attach outcome details to request

### Fund Validation (request-validation/funds/)

#### validate-create-fund-request.ts
- Validate fund creation parameters
- Fund name, starting balance

#### validate-portfolio-history-resolution.ts
- Validate time resolution (1, 5, 30, 180 minutes)
- Only allow valid resolutions

### Events Validation (request-validation/events/)

#### validate-offset-query-param.ts
- Validate pagination offset
- Ensure non-negative integer

#### validate-event-id-in-params.ts
- Validate event slug format

---

## Error Handling Patterns

### Validation Error
```typescript
res.status(400).json({
  validationError: "Field must be a valid email"
})
```

### Unauthorized
```typescript
res.status(401).json({
  error: "Unauthorized User"
})
```

### Forbidden / Authorization Denied
```typescript
res.status(400).json({
  message: "This fund is owned by another user"
})
```

### Rate Limited
```typescript
res.status(429).json({
  error: "Too many requests, please try again later"
})
```

### Server Error
```typescript
res.status(500).json({
  error: "Internal Server Error: [Specific context]"
})
```

---

## Req Object Extensions

Middleware attaches data to `req` for downstream use:

```typescript
// After JWT middleware
req.userId: number

// After JWT full user middleware
req.user: ExtendedCredentials

// After event attachment
req.eventId: EventId

// After validation
req.validatedBuyOrder: { wiretapFundUuid, numberOfSharesPurchasing, currentPrice }
```

---

## When Adding New Middleware

### 1. Determine Category

- **Global**: Applies to all requests (edit `init-config.ts`)
- **Rate Limiting**: Create in `rate-limiters.ts`
- **JWT**: Create in `jwt/` subdirectory
- **Data Attachment**: Create in `attach/` subdirectory
- **Authorization**: Create in `confirm/` subdirectory
- **Validation**: Create in `request-validation/{feature}/` subdirectory

### 2. Implementation Pattern

```typescript
// Validation middleware
import Joi from "joi"
import { Request, Response, NextFunction } from "express"

const schema = Joi.object({ ... })

export default function validateSomething(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { error } = schema.validate(req.body)

  if (error) {
    res.status(400).json({ validationError: error.details[0].message })
    return
  }

  next()
}
```

### 3. Mount in Routes

```typescript
// src/routes/feature-routes.ts
router.post(
  "/endpoint",
  validateMiddleware,
  confirmOwnershipMiddleware,
  controllerFunction
)
```

### 4. Document Changes

- Update this file with new middleware purpose
- Add JSDoc comments for complex logic
- Document `req` extensions

---

## Best Practices

### 1. Fail-Fast
Return error immediately when check fails. Don't continue middleware chain.

```typescript
if (error) {
  res.status(400).json({ error: "..." })
  return  // Stop execution
}
```

### 2. Consistent Error Responses
Use standard error response formats:
- Validation errors: `validationError`
- Auth errors: `error: "Unauthorized"`
- Messages: `message`

### 3. Logging
Log errors with context for debugging:
```typescript
console.error("Auth rate limit exceeded:", req.ip)
console.error("JWT verification error:", error)
```

### 4. Minimize DB Queries
Cache results, combine queries, avoid N+1 patterns.

### 5. Order Matters
Middleware order is execution order. Place rate limiting early, validation before confirmation.

---

## Related Files
- `../routes/` - Mount middleware in routes
- `../controllers/` - Handlers called after middleware
- `../utils/auth-helpers/` - JWT signing/verification
- `../db-operations/read/` - Queries for confirmation middleware
