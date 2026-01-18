# Config Directory

This directory contains application configuration utilities for Express setup and CORS configuration.

## Structure

```
config/
├── setup-routes.ts              # Mount all API routes with middleware
└── get-allowed-origins.ts       # CORS allowed origins configuration
```

## Files

### setup-routes.ts
Centralizes all route mounting and applies appropriate middleware to route groups.

**Function**: `setupRoutes(app: Express): void`

**Purpose**:
- Single source of truth for all API endpoints
- Consistent middleware application across related routes
- Clear visibility into authentication and rate limiting strategy

**Routes and Middleware**:

| Path | Rate Limiter | Auth Middleware | Routes |
|------|--------------|-----------------|--------|
| /auth | authRateLimiter | None | Authentication endpoints |
| /events | eventsRateLimiter | None | Public event browsing |
| /personal-info | (route-level) | (route-level) | User account endpoints |
| /trade | tradingRateLimiter | jwtVerifyAttachUserId | Trading operations |
| /funds | tradingRateLimiter | jwtVerifyAttachUserId | Fund management |
| /internal | None | None | Internal/admin endpoints |
| /health | None | None | Health check |
| /misc | (route-level) | (route-level) | Miscellaneous endpoints |

**Mounting pattern**:
```typescript
app.use("/path", [middleware...], routeHandler)
```

**Key decisions**:
- Auth routes use permissive rate limiting (public signup/login)
- Events routes public and browsable (no auth required)
- Trading and funds routes require JWT authentication
- Rate limiters prevent API abuse
- Some routes define their own middleware internally

**Usage**:
```typescript
const app = express()
setupRoutes(app)  // All routes now available
```

**Related files imported**:
- All route files from `../../routes/`
- Middleware from `../../middleware/`
- Health check controller from `../../controllers/`

---

### get-allowed-origins.ts
Defines CORS-allowed origins based on environment.

**Function**: `allowedOrigins(): string[]`

**Returns**: Array of allowed origin URLs

**Production origins**:
- `https://wiretap.pro`
- `https://www.wiretap.pro`

**Development origins**:
- `http://localhost:3000`

**Usage**:
```typescript
const origins = allowedOrigins()
app.use(cors({ origin: origins }))
```

**Environment detection**:
- `process.env.NODE_ENV === "production"` → production origins
- Otherwise → development origins

**Key details**:
- Prevents CORS attacks by restricting API access
- Separate configs for dev and production
- Simple environment-based switching
- Uses standard HTTPS for production

---

## Configuration Architecture

### Middleware Hierarchy

1. **Global middleware** (applied in index.ts via configureAppMiddleware)
   - CORS
   - Body parsing
   - Request logging
   - Error handling

2. **Route-group middleware** (applied in setupRoutes)
   - Rate limiting by endpoint sensitivity
   - JWT authentication for protected routes
   - Routes mounted with specific middleware

3. **Route-level middleware** (defined in individual route files)
   - Request validation
   - Confirmation/authorization
   - Custom route-specific middleware

### Middleware Application Flow

```
Request → Global Middleware → Route Group Middleware → Route Middleware → Controller
```

---

## CORS Configuration

### Why CORS Matters
- Prevents unauthorized websites from accessing the API
- Restricts browser-based requests to allowed origins
- Essential for web security

### Origin Verification
- Only requests from listed origins accepted
- Wildcard `*` NOT used in production (too permissive)
- Domain matching is exact (www and non-www separate)

### For New Domains
Update `get-allowed-origins.ts` when adding new production domains:
```typescript
if (process.env.NODE_ENV === "production") {
  return [
    "https://wiretap.pro",
    "https://www.wiretap.pro",
    "https://newdomain.com"  // Add here
  ]
}
```

---

## When Adding New Routes

1. Create route file in `../../routes/` with endpoint definitions
2. Import route in `setup-routes.ts`
3. Mount with appropriate middleware:
   ```typescript
   app.use("/feature", [requiredMiddleware], featureRoutes)
   ```
4. Consider rate limiting level needed:
   - Public: `authRateLimiter` or `eventsRateLimiter`
   - Authenticated: `tradingRateLimiter`
   - Account: `generalRateLimiter`

---

## Related Files
- `../../index.ts` - Calls setupRoutes on server startup
- `../../middleware/init-config.ts` - Applies global middleware including CORS
- `../../routes/` - All route definitions
- `../../middleware/` - Rate limiters and JWT verification
