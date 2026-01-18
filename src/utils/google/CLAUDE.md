# Google Directory

This directory contains Google authentication integration utilities.

## Structure

```
google/
└── create-google-auth-client.ts    # Initialize Google OAuth2 client
```

## Files

### create-google-auth-client.ts
Initializes and returns a configured Google OAuth2 client for authentication.

**Function**: `createGoogleAuthClient(): Promise<OAuth2Client>`

**Returns**: Configured `OAuth2Client` instance from `google-auth-library`

**Process**:
1. Retrieves Google OAuth credentials from AWS Secrets Manager
   - `GOOGLE_CLIENT_ID`: Application client ID
   - `GOOGLE_CLIENT_SECRET`: Application secret key
2. Creates and returns OAuth2Client with credentials
3. Sets redirect type to `postmessage` (for browser-based auth)

**Usage**:
```typescript
const client = await createGoogleAuthClient()
// Use client to verify Google tokens, exchange codes, etc.
```

**Key details**:
- Secrets retrieved from AWS Secrets Manager (not hardcoded)
- Always uses `await` (async operation)
- Redirect type `postmessage` indicates browser-based authentication (not server redirect)
- Errors logged and thrown

---

## Google OAuth2 Flow

### Setup Requirements

**Google Cloud Console setup**:
1. Create OAuth 2.0 credentials (Web application type)
2. Add authorized redirect URIs for your app
3. Obtain Client ID and Client Secret
4. Store credentials in AWS Secrets Manager:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

### Authentication Flow

**User Login**:
1. Frontend directs user to Google login
2. User authorizes app and gets access token
3. Frontend sends access token to backend
4. Backend verifies token using OAuth2Client:
   ```typescript
   const client = await createGoogleAuthClient()
   const ticket = await client.verifyIdToken({ idToken: token })
   const payload = ticket.getPayload()
   const userId = payload.sub
   ```
5. Create/update user in database
6. Return JWT token for session

**Token Verification**:
- `verifyIdToken()` validates Google's signature
- Throws if token is invalid or expired
- Returns payload with user information

---

## OAuth2Client Configuration

### Redirect Type: `postmessage`

The `postmessage` redirect type indicates:
- Browser-based authentication (not server-side redirect)
- Frontend exchanges auth code for ID token directly
- Backend receives and verifies the token
- Suitable for Single Page Applications (SPAs)

### Alternative: Server-side redirect
Would use a redirect URL like `https://app.com/auth/google/callback` instead.

---

## Security Considerations

### Credentials Management
- Client ID and Secret stored in AWS Secrets Manager
- Never hardcoded in source
- Retrieved on each OAuth operation

### Token Verification
- Always verify tokens with OAuth2Client
- Never trust unverified tokens
- Check token expiration and issuer

### Session Management
- Create secure JWT session after verification
- Don't expose Google tokens to frontend
- Use JWT for subsequent authenticated requests

---

## Related Services

### Google APIs Used
- [Google Identity Services](https://developers.google.com/identity/sign-in/web)
- [OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [OpenID Connect](https://developers.google.com/identity/openid-connect)

### Related Files
- `../../classes/aws/secrets-manager.ts` - Retrieves OAuth credentials
- `../../controllers/auth/google-login-auth-callback.ts` - Uses client for token verification
- `../../middleware/request-validation/auth/validate-google-login-auth-callback.ts` - Validates incoming auth requests

---

## Troubleshooting

### Common Issues

**"Credentials not found"**
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in AWS Secrets Manager
- Verify environment variable `NODE_ENV` is set

**"Invalid token"**
- Token may be expired (Google tokens expire quickly)
- Token may be from different OAuth client
- Verify OAuth client ID matches between frontend and backend

**"Redirect URI mismatch"**
- Ensure `postmessage` is added to authorized redirect URIs in Google Cloud Console
- Verify client ID/secret match configuration

---

## When Updating OAuth Configuration

1. Update credentials in AWS Secrets Manager
2. Restart application (or wait for next secret refresh)
3. Test authentication flow
4. Monitor logs for credential errors

## Related Files
- `../../utils/auth-helpers/jwt/sign-jwt.ts` - Creates JWT after Google verification
- `../../controllers/auth/google-login-auth-callback.ts` - Main Google auth handler
