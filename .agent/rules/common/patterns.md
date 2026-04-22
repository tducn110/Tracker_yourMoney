---
trigger: always_on
---

# Common Patterns (S2S Finance)

## Skeleton Projects

When implementing new functionality:
1. Search for battle-tested skeleton projects (e.g., Next.js + Hono + Drizzle monorepo starters)
2. Use parallel agents to evaluate options:
   - Security assessment (JWT, idempotency)
   - Extensibility analysis (monorepo structure)
   - Relevance scoring (TypeScript, Edge compatibility)
   - Implementation planning
3. Clone best match as foundation
4. Iterate within proven structure

## Design Patterns

### Repository Pattern with Drizzle ORM

Encapsulate data access behind a consistent interface. All repositories extend `BaseRepository` to support dependency injection and transaction propagation.

```typescript
// packages/db/src/repositories/transaction.repo.ts
export class TransactionRepository extends BaseRepository {
  async findById(id: string, userId: string, tx?: DB) {
    const client = tx || this.db;
    return client.query.transactions.findFirst({
      where: and(
        eq(transactions.id, id),
        eq(transactions.userId, userId),
        isNull(transactions.deletedAt)
      ),
      with: { category: true }
    });
  }

  async create(data: NewTransaction, tx?: DB) {
    const client = tx || this.db;
    const result = await client.insert(transactions).values(data);
    const id = String(result.insertId);
    return this.findById(id, data.userId, client);
  }
}
```

### Service Layer Pattern

Business logic lives in dedicated service classes, which receive repositories and external adapters via **Dependency Injection (DI)**. This enables unit testing with mocks and keeps the API routes thin.

```typescript
// apps/api/src/services/transaction-service.ts
export class TransactionService {
  constructor(
    private readonly repository: TransactionRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly nlpAdapter: INLPAdapter,
    private readonly cache: ICache
  ) {}

  async quickAdd(userId: string, text: string, options: { categoryId?: number; idempotencyKey?: string }) {
    const parsed = this.nlpAdapter.parse(text);
    // ... business logic ...
    return this.repository.create({ ... });
  }
}
```

### DI Container Pattern

Services are instantiated via a container (`apps/api/src/services/container.ts`) and exported as proxies to support runtime re-initialization for testing.

```typescript
// apps/api/src/services/container.ts
export const container = new Container();
export const transactionService = createServiceProxy(() => container.transactionService);
```

### API Response Format (Hono)

Use a consistent envelope for all API responses, defined in `apps/api/src/lib/response.ts`.

```typescript
// Success
{ success: true, data: T, meta?: { page?: number; limit?: number; total?: number } }

// Error
{ success: false, error: { code: string; message: string; details?: unknown } }
```

### Adapter Pattern (NLP Parsing)

The NLP parsing logic is abstracted behind the `INLPAdapter` interface, allowing easy swapping between regex-based parsing and future LLM integration.

```typescript
// apps/api/src/services/adapters/nlp-adapter.ts
export interface INLPAdapter {
  parse(text: string): NLPParsedResult;
}

export class RegexNLPAdapter implements INLPAdapter {
  parse(text: string): NLPParsedResult { /* ... */ }
}
```

### Cache Abstraction

Caching is abstracted via `packages/cache` with a `NullCache` implementation for MVP, allowing drop-in replacement with Redis later.

```typescript
// packages/cache/src/interface.ts
export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
}
```

### Financial Precision Pattern

All monetary values are stored as `DECIMAL(15,2)` in TiDB, transferred as `string` in JSON, and calculated using `Decimal.js` to avoid floating-point errors.

```typescript
// ✅ CORRECT
const amount = new Decimal(tx.amount);
const newBalance = amount.plus(deposit).toFixed(2);

// ❌ WRONG
const newBalance = Number(tx.amount) + Number(deposit);
```

### Zod Schema Sharing

Validation schemas are defined in a shared package (`@finance/shared-schemas`) and used by both frontend and backend for end-to-end type safety.

```typescript
// packages/shared-schemas/src/transaction.schema.ts
export const insertTransactionSchema = z.object({
  categoryId: z.number().int().positive(),
  amount: decimalString,
  type: z.enum(["income", "expense", "transfer"]),
  displayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  // ...
});
```

### Optimistic Concurrency Control (OCC)

For balance updates (e.g., `cash_wallet`), use a `version` column to detect concurrent modifications and prevent lost updates. (Note: TiDB Serverless does not support `SELECT ... FOR UPDATE` in HTTP mode.)

```typescript
// Example: cash wallet update with version check
const result = await db.update(cashWallet)
  .set({ balance: newBalance, version: currentVersion + 1 })
  .where(and(
    eq(cashWallet.userId, userId),
    eq(cashWallet.version, currentVersion)
  ));
if (result.affectedRows === 0) {
  throw new ConcurrencyConflictError();
}
```

### Idempotency Pattern

All financial mutations require an `Idempotency-Key` header. The key is stored in the database within the same transaction to prevent duplicate processing.

```typescript
// apps/api/src/services/idempotency.ts
export const IdempotencyStorageAdapter = {
  async get(key: string): Promise<boolean> { /* ... */ },
  async set(key: string, ttlSeconds?: number): Promise<void> { /* ... */ }
};
```

## React/Next.js Patterns

### Custom Hooks with React Query

Encapsulate data fetching and mutations in custom hooks for reusability and cache management.

```typescript
// apps/web/src/_lib/hooks/finance.ts
export function useS2SSummary() {
  return useQuery({
    queryKey: ['finance', 's2s'],
    queryFn: () => s2sAPI.getSummary()
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 's2s'] });
    }
  });
}
```

### Server Component with Client Suspense

Use Next.js App Router patterns: Server Components for initial shell, Client Components for interactivity.

```typescript
// app/(dashboard)/page.tsx (Server Component)
import { Suspense } from 'react';
import { DashboardContent } from './_components/DashboardContent';
import { DashboardSkeleton } from '@/_components/ui/dashboard-skeleton';

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
```

### Type-Safe API Client

The `@finance/api-client` package provides a typed Axios client with automatic snake_case/camelCase conversion.

```typescript
// packages/api-client/src/client.ts
apiClient.interceptors.request.use((config) => {
  if (config.data) config.data = toSnake(config.data);
  return config;
});

apiClient.interceptors.response.use((response) => toCamel(response.data));
```
```
