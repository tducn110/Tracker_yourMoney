---
trigger: always_on
---


# Testing Requirements (S2S Finance)

## Minimum Test Coverage

- **Overall**: 80% coverage required
- **Financial calculation functions** (S2S engine, `Decimal.js` utilities): **100% coverage mandatory**

## Test Types

| Type | Tool | Scope |
|------|------|-------|
| Unit Tests | Vitest | Individual functions, utilities, React components |
| Integration Tests | Vitest | API endpoints, service + repository layers |
| E2E Tests | Playwright | Critical user flows (login → add transaction → S2S update) |

## Test-Driven Development Workflow

1. **RED** – Write a failing test first
2. **GREEN** – Write minimal code to pass
3. **REFACTOR** – Improve code while keeping tests green
4. **VERIFY** – Check coverage meets thresholds

## Financial Precision Testing

All monetary calculations must be tested for exact precision:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateS2SValue } from '../lib/finance-utils';
import Decimal from 'decimal.js';

describe('S2S Calculation', () => {
  it('maintains exact decimal precision', () => {
    const result = calculateS2SValue({
      income: '25000000.00',
      expense: '12345678.90',
      fixedCosts: '5000000.00',
      goalsAllocation: '3000000.00',
      emergencyBuffer: '1500000.00'
    });
    expect(result.amount).toBe('3154321.10');
  });

  it('never uses Number() or parseFloat on money', () => {
    const amount = new Decimal('123.45');
    expect(amount.toFixed(2)).toBe('123.45');
  });
});
```

## Mocking Strategy

### Database (Drizzle)
```typescript
vi.mock('@finance/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([])
  }
}));
```

### External Services
```typescript
vi.mock('../services/ai-service', () => ({
  parseQuickAdd: vi.fn().mockResolvedValue({ amount: '35000', categoryId: 2 })
}));
```

## Running Tests

```bash
pnpm test              # All tests
pnpm test:coverage     # With coverage report
pnpm test:e2e          # Playwright E2E tests
pnpm test -- --watch   # Watch mode during development
```

## Troubleshooting

1. Use **tdd-guide** agent for complex test scenarios.
2. Ensure each test is isolated and cleans up after itself.
3. Reset all mocks between tests (`vi.clearAllMocks()`).
4. Never change a test to make it pass unless the test itself is incorrect.
```
