---
trigger: always_on
---

---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---
# TypeScript/JavaScript Patterns (S2S Finance)

> This file extends [common/patterns.md](../common/patterns.md) with TypeScript/JavaScript specific content.

## API Response Format (Hono)

The project uses a consistent envelope for all API responses, defined in `apps/api/src/lib/response.ts`:

```typescript
// Success response
interface ApiSuccess<T> {
  success: true
  data: T
  meta?: {
    page?: number
    total?: number
    limit?: number
  }
}

// Error response
interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

// Usage in Hono routes
import { ok, created, err } from '../lib/response'

app.get('/api/transactions', async (c) => {
  const data = await service.getAll()
  return ok(c, data, { page: 1, limit: 20, total: 100 })
})
```

## Custom Hooks Pattern (React Query)

Encapsulate data fetching and mutations in custom hooks using TanStack Query. See `apps/web/src/_lib/hooks/finance.ts`:

```typescript
export function useS2SSummary() {
  return useQuery({
    queryKey: ['finance', 's2s'],
    queryFn: () => s2sAPI.getSummary(),
    staleTime: 60 * 1000,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: transactionsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['finance', 's2s'] })
    },
  })
}
```

## Repository Pattern with Drizzle

All data access is encapsulated in repository classes extending `BaseRepository`. See `packages/db/src/repositories/`:

```typescript
import { BaseRepository, type DB } from './base-repository'
import { transactions, type Transaction, type NewTransaction } from '../schema'

export class TransactionRepository extends BaseRepository {
  async findById(id: string, userId: string, tx?: DB): Promise<Transaction | null> {
    const client = tx || this.db
    const [record] = await client
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.id, id),
          eq(transactions.userId, userId),
          isNull(transactions.deletedAt)
        )
      )
      .limit(1)
    return record || null
  }

  async create(data: NewTransaction, tx?: DB): Promise<Transaction> {
    const client = tx || this.db
    const result = await client.insert(transactions).values(data)
    const id = String(result.insertId)
    return this.findById(id, data.userId, client) as Promise<Transaction>
  }
}
```

## Adapter Pattern (NLP)

The NLP parsing logic is abstracted behind an interface, allowing easy swapping between regex and future LLM implementations:

```typescript
// apps/api/src/services/adapters/nlp-adapter.ts
export interface INLPAdapter {
  parse(text: string): NLPParsedResult
}

export class RegexNLPAdapter implements INLPAdapter {
  parse(text: string): NLPParsedResult {
    // Regex-based parsing for Vietnamese input (e.g., "ăn sáng 35k")
  }
}
```

## Financial Precision Pattern

All monetary values are stored as strings and calculated with `Decimal.js`:

```typescript
import Decimal from 'decimal.js'

function addAmount(a: string, b: string): string {
  return new Decimal(a).plus(b).toFixed(2)
}

// In React components, format for display only
import { formatCurrency } from '@finance/api-client'

<span>{formatCurrency(transaction.amount, 'vi-VN')}</span>
```

## Dependency Injection Container

Services are instantiated via a DI container to support testing and runtime re-initialization:

```typescript
// apps/api/src/services/container.ts
export class Container {
  private _transactionService: TransactionService

  constructor() {
    const repo = new TransactionRepository(db)
    const nlp = new RegexNLPAdapter()
    this._transactionService = new TransactionService(repo, nlp)
  }

  get transactionService() { return this._transactionService }
}

// Proxy for dynamic re-initialization (e.g., in tests)
export const transactionService = createServiceProxy(() => container.transactionService)
```
