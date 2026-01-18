# Types Directory

This directory contains TypeScript type definitions and interfaces for the Wiretap server application.

## Structure

```
types/
├── auth.ts                 # Authentication-related types (user fields, hashed strings)
├── custom-express.ts       # Express.js type extensions
├── environment.ts          # Environment variable types
├── polymarket.ts           # Polymarket API types (events, markets, tags, series)
├── pricing.ts              # Pricing-related types
├── prisma.ts               # Prisma-related type extensions
├── trade.ts                # Trade operation types
├── utils.ts                # Utility types
└── common/
    ├── common.ts           # Common types used across the application
    └── common-api.ts       # Common API-related types
```

## Key Files

### auth.ts
- Extends global namespace with authentication types
- Defines `NewLocalUserFields` interface for local user creation
- Uses branded types like `HashedString` to enforce type safety for sensitive data

### polymarket.ts
- Comprehensive type definitions for Polymarket GAMMA API integration
- Main interfaces:
  - `PolymarketEvent`: Event data structure
  - `PolymarketMarket`: Individual market data
  - `PolymarketTag`: Tag/category metadata
  - `PolymarketSeries`: Series grouping
- Helper types for parsed market data
- Query parameter types for API requests
- **Note**: Market data fields like `outcomes` and `outcomePrices` are JSON strings, not arrays

### common/
- `common.ts`: Core types used throughout the application
- `common-api.ts`: API request/response types

## Type Definition Guidelines

### Branding and Type Safety
- Use branded/phantom types for semantic type safety (e.g., `HashedString`)
- This prevents accidentally passing regular strings where specific types are needed

### Global Namespace Extensions
- Types that extend global namespace (auth, polymarket) use `declare global` and `export {}`
- This makes types available across the entire project without imports

### Documentation
- Include comments for complex type structures
- Document special field behaviors (e.g., "JSON strings, not arrays")
- Note API-specific quirks or non-obvious field meanings

### API Types
- Keep API response types organized by source/feature
- Document filtering and query parameter options
- Note any defaults or constraints (e.g., "max 100 results")

## Common Patterns

1. **JSON String Fields**: Some fields are stored as JSON strings for compatibility
   - Parse with `JSON.parse()` before use
   - Document the expected structure in comments

2. **Optional Fields**: Use `?` for fields that may not always be present
   - Polymarket API returns many optional fields

3. **Branded Types**: For sensitive data (passwords, IDs)
   ```typescript
   type HashedString = string & { __hashed: true }
   type EventId = string & { __eventId: true }
   ```

4. **Status Flags**: Boolean flags for status tracking
   - `active`, `closed`, `archived`, `featured`, `restricted`
   - Document what each status means

## When Adding New Types

1. Determine the appropriate file based on feature/domain
2. If types are used globally, consider adding to `common/`
3. If extending an external library (Express, Prisma), create a dedicated file
4. Include JSDoc comments for complex types
5. Consider type safety through branding for critical values (IDs, hashed data, etc.)
6. Update this file with new type groups if creating a new file

## Related Files
- `../controllers/` - Uses these types for route handlers
- `../db-operations/` - Uses common and Prisma types
- `prisma/schema.prisma` - Database schema that influences some type definitions
