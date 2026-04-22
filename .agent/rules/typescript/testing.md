---
trigger: always_on
---

```markdown
---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---
# TypeScript/JavaScript Testing (S2S Finance)

> This file extends [common/testing.md](../common/testing.md) with TypeScript/JavaScript specific content.

## Unit & Integration Testing with Vitest

Use **Vitest** for unit and integration tests across the monorepo.

```typescript
// apps/api/src/services/__tests__/transaction-service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TransactionService } from '../transaction-service'
import { TransactionRepository } from '@finance/db'

describe('TransactionService', () => {
  let service: TransactionService
  let mockRepo: TransactionRepository

  beforeEach(() => {
    mockRepo = {
      create: vi.fn(),
      findById: vi.fn(),
    } as any
    service = new TransactionService(mockRepo, mockNLP, mockCache)
  })

  it('should create transaction with correct amount', async () => {
    mockRepo.create.mockResolvedValue({ id: '123', amount: '50000' })
    const result = await service.createTransaction('user-1', { amount: '50000', type: 'expense' })
    expect(result.amount).toBe('50000')
  })
})
```

## Component Testing with React Testing Library

Use **React Testing Library** for component tests.

```typescript
// apps/web/src/_components/__tests__/S2SHeroSection.test.tsx
import { render, screen } from '@testing-library/react'
import { S2SHeroSection } from '../s2s/S2SHeroSection'

const mockData = {
  s2sRemaining: '5800000',
  usagePercent: 42,
  status: 'safe',
  // ... other required props
}

describe('S2SHeroSection', () => {
  it('displays safe-to-spend amount in VND', () => {
    render(<S2SHeroSection data={mockData} />)
    expect(screen.getByText(/5.800.000₫/)).toBeInTheDocument()
  })
})
```

## E2E Testing with Playwright

Use **Playwright** for critical user flows.

```typescript
// apps/web/e2e/transactions.spec.ts
import { test, expect } from '@playwright/test'

test('user can add transaction and see S2S update', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'demo@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  const before = await page.locator('[data-testid="s2s-amount"]').textContent()

  await page.click('[data-testid="quick-add"]')
  await page.fill('[data-testid="quick-add-input"]', 'ăn sáng 35k')
  await page.click('[data-testid="quick-add-submit"]')

  await expect(page.locator('[data-testid="s2s-amount"]')).not.toHaveText(before)
})
```

## Financial Precision Testing

All monetary calculations must have dedicated precision tests.

```typescript
import Decimal from 'decimal.js'

describe('Financial Calculations', () => {
  it('maintains exact decimal precision', () => {
    const a = new Decimal('0.1')
    const b = new Decimal('0.2')
    expect(a.plus(b).toFixed(2)).toBe('0.30') // Not 0.30000000000000004
  })
})
```

## Agent Support

- **tdd-guide** - Use proactively for new features, enforces write-tests-first
- **e2e-runner** - Playwright E2E testing specialist
```