# Auth Helpers Directory

This directory contains authentication utilities for JWT token generation and validation.

## Structure

```
auth-helpers/
├── get-decoded-id.ts    # Extract and verify JWT tokens
└── jwt/
    └── sign-jwt.ts      # Generate JWT tokens
```

## Files

### get-decoded-id.ts
Verifies and decodes JWT access tokens to extract user ID.

**Function**: `getDecodedId(accessToken: string): Promise<number>`

**Process**:
1. Retrieves JWT secret key from AWS Secrets Manager
2. Verifies token signature using jsonwebtoken library
3. Casts decoded payload to `JwtPayload` type
4. Extracts and returns `userId` from payload

**Return value**: User ID (number)

**Throws**: Error if token is invalid, expired, or signature verification fails

**Usage**:
```typescript
const userId = await getDecodedId(token)
```

**Key details**:
- JWT secret stored securely in AWS Secrets Manager (not in code)
- Always uses `await` (async operation)
- Errors logged and thrown (never silently fails)

---

### jwt/sign-jwt.ts
Generates JWT tokens with user authentication payload.

**Function**: `signJWT(payload: JwtPayload): Promise<string>`

**Process**:
1. Retrieves JWT secret key from AWS Secrets Manager
2. Signs payload using jsonwebtoken library with secret
3. Returns encoded JWT string

**Input**: `JwtPayload` object (typically contains `userId`)

**Return value**: Signed JWT token string

**Throws**: Error if signing fails or secret retrieval fails

**Usage**:
```typescript
const token = await signJWT({ userId: 123 })
```

**Key details**:
- JWT secret stored securely in AWS Secrets Manager
- Always uses `await` (async operation)
- Errors logged and thrown

---

## JWT Architecture

### Token Flow

**Login**:
1. User provides credentials
2. Credentials validated
3. `signJWT()` creates token with user ID
4. Token returned to client

**Authenticated Requests**:
1. Client sends token in Authorization header
2. Middleware calls `getDecodedId()` to extract user ID
3. User ID attached to request
4. Route handler accesses `req.userId`

### JWT Payload Structure

```typescript
interface JwtPayload {
  userId: number
  // Other fields can be added as needed
}
```

---

## Security Considerations

**JWT Secret Management**:
- Secret stored in AWS Secrets Manager (production)
- Never hardcoded in source
- Retrieved on each token operation

**Token Validation**:
- Signature verification prevents tampering
- `getDecodedId()` throws on invalid tokens
- No silent failures

**Error Handling**:
- All errors logged to console
- Errors thrown to caller for handling
- No token details leaked in logs

---

## When Adding New Auth Utilities

1. Determine if it's a JWT operation or other auth operation
2. Place JWT-related code in `jwt/` subdirectory
3. Follow error handling pattern: log and throw
4. Use AWS Secrets Manager for secrets
5. Always make functions async if they fetch secrets
6. Update this documentation

## Related Files
- `../../classes/aws/secrets-manager.ts` - Retrieves JWT secret
- `../../middleware/jwt/` - Uses these functions to verify requests
- `../../controllers/auth/` - Uses `signJWT()` during login
