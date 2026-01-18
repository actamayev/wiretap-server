# Classes Directory

This directory contains reusable class-based utilities and singleton patterns for the Wiretap server. Classes here implement core infrastructure, security, data management, and external service integrations.

## Structure

```
classes/
├── singleton.ts              # Abstract base class for Singleton pattern
├── hash.ts                   # Password hashing and verification utilities
├── prisma-client.ts          # Prisma ORM client initialization and management
├── events-cache.ts           # In-memory cache for Polymarket events with periodic refresh
└── aws/
    └── secrets-manager.ts    # AWS Secrets Manager integration for secure credential handling
```

## Key Classes

### Singleton (singleton.ts)
Abstract base class implementing the Singleton pattern.

**Purpose**: Ensures only one instance of a class exists throughout the application lifecycle.

**Key features**:
- Protected constructor prevents direct instantiation
- Abstract `getInstance()` method enforces implementation in subclasses
- Default region set to "us-east-1" for AWS services

**Usage**: Extend this class when building infrastructure services that should have a single instance.

```typescript
export default class MyService extends Singleton {
  public static override getInstance(): MyService {
    if (MyService.instance === null) {
      MyService.instance = new MyService()
    }
    return MyService.instance
  }
}
```

### Hash (hash.ts)
Password hashing and verification using bcrypt.

**Methods**:
- `hashCredentials(unhashedData: string): Promise<HashedString>`
  - Hashes plaintext strings using bcrypt with 10 salt rounds
  - Returns `HashedString` branded type for type safety
  - Used for user password storage

- `checkPassword(plaintextPassword: string, hashedPassword: HashedString): Promise<boolean>`
  - Compares plaintext password against bcrypt hash
  - Returns true if passwords match, false otherwise

**Security notes**:
- Salt rounds set to 10 (reasonable balance of security and performance)
- Always catches and logs errors; never silently fails
- Returns branded `HashedString` type to prevent accidental use of unhashed passwords

### PrismaClientClass (prisma-client.ts)
Manages Prisma ORM client initialization and connection pooling.

**Key features**:
- Singleton pattern ensures only one database connection
- Lazy initialization: client created on first request
- Environment-aware SSL configuration:
  - **Production**: Uses PostgreSQL adapter with SSL (`sslmode=no-verify`)
  - **Development**: Uses plain connection string
- Retrieves database URL from AWS Secrets Manager in production
- Connection string URL normalization (trimming, parameter handling)

**Usage**:
```typescript
const prisma = await PrismaClientClass.getPrismaClient()
```

**Important notes**:
- Always use `await` when calling `getPrismaClient()`
- Client is cached after first initialization
- SSL configuration prevents connection issues with AWS RDS

### EventsCache (events-cache.ts)
In-memory cache for Polymarket events with automatic periodic refresh.

**Purpose**: Reduces database queries by caching frequently-accessed event metadata.

**Key features**:
- Extends `Singleton` for single instance
- Automatic refresh interval: 60 seconds (1 minute)
- Events stored in array sorted by volume (descending - highest volume first)
- Prevents concurrent refresh operations with `isRefreshing` flag
- Graceful degradation: keeps stale cache if refresh fails

**Methods**:
- `startRefreshTimer()`: Initiates periodic cache refresh
- `stopRefreshTimer()`: Stops the refresh interval
- `getEventsMetadataOrFetch()`: Returns cached events or fetches if cache empty
- `getSingleEventMetadataOrFetch(eventId)`: Retrieves specific event from cache

**Refresh behavior**:
- Initial fetch happens immediately on `startRefreshTimer()`
- Subsequent refreshes run on 60-second interval
- Concurrent refreshes prevented by `isRefreshing` lock
- If refresh fails, existing cache is preserved
- Empty cache waits for refresh to complete before returning

### SecretsManager (aws/secrets-manager.ts)
AWS Secrets Manager integration for secure credential management.

**Purpose**: Securely retrieve and cache sensitive environment variables from AWS Secrets Manager in production.

**Key features**:
- Extends `Singleton` for single instance
- Uses AWS SDK v3 `SecretsManagerClient`
- In-memory cache (`Map<SecretKeys, string>`) to reduce API calls
- Environment-aware behavior:
  - **Production**: Fetches from AWS Secrets Manager
  - **Development**: Falls back to process.env
- Batch secret retrieval for efficiency

**Methods**:
- `getSecret(key: SecretKeys): Promise<string>`
  - Retrieves single secret with caching
  - Falls back to environment variable in development

- `getSecrets(keys: SecretKeys[]): Promise<SecretsObject>`
  - Batch retrieves multiple secrets
  - Fetches all secrets from AWS once, then caches

**AWS Configuration**:
- Credentials from `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` env vars
- Region: "us-east-1" (from Singleton parent)
- Production secret name: `wiretap-production-secrets`

**Security notes**:
- Secrets cached in-memory to reduce AWS API calls
- Only initializes AWS client if `NODE_ENV` is set
- Validates secret retrieval before returning
- Errors logged but not suppressed

## Singleton Pattern in This Project

Most infrastructure classes extend `Singleton` to ensure single instance throughout app:
- `EventsCache`: Single cache instance shared across all requests
- `SecretsManager`: Single credentials store for entire app
- `PrismaClientClass`: Single database connection pool

This pattern is important for:
1. **Resource efficiency**: One connection/cache shared by all requests
2. **State consistency**: All parts of app see same data
3. **Initialization control**: Services initialize on-demand

## When Adding New Classes

1. **Infrastructure services**: Extend `Singleton` (database, cache, external APIs)
2. **Utility classes**: Static methods only (like `Hash`)
3. **Documentation**: Include JSDoc for public methods
4. **Error handling**: Always log and throw errors; never silently fail
5. **Update this file**: Document purpose, methods, and usage patterns

## Related Files
- `../types/` - Type definitions for class methods and parameters
- `../generated/prisma/` - Generated Prisma client types
- `../db-operations/` - Uses `PrismaClientClass` and `EventsCache`
- `.env` / AWS Secrets Manager - Source of configuration values
