---
trigger: always_on
---

# Coding Style (S2S Finance)

## Financial Precision (CRITICAL)

- **NO `number` for money**: Always use `string` for API transfer and `Decimal.js` for calculations.
- **NO `parseFloat` or `Number()`** on monetary values.
- **BigInt IDs**: Use `string` for all `bigint` IDs from TiDB. Never convert to `number`.

```typescript
// ✅ CORRECT
const amount = new Decimal(tx.amount);
const newBalance = amount.plus(deposit).toFixed(2);

// ❌ WRONG
const newBalance = Number(tx.amount) + Number(deposit);
```

## Immutability (CRITICAL)

ALWAYS create new objects, NEVER mutate existing ones:

```
WRONG:  modify(original, field, value) → changes original in-place
CORRECT: update(original, field, value) → returns new copy with change
```

Rationale: Immutable data prevents hidden side effects, makes debugging easier, and enables safe concurrency.

## File Organization

MANY SMALL FILES > FEW LARGE FILES:
- High cohesion, low coupling
- 200-400 lines typical, 800 max
- Extract utilities from large modules
- Organize by feature/domain, not by type
- Use monorepo packages (`@finance/db`, `@finance/shared-schemas`)

## Error Handling

ALWAYS handle errors comprehensively:
- Handle errors explicitly at every level
- Provide user-friendly error messages in UI-facing code
- Log detailed error context on the server side using `pino`
- Never silently swallow errors
- Use typed errors (e.g., `class InsufficientBalanceError extends Error {}`)

## Input Validation

ALWAYS validate at system boundaries:
- Validate all user input before processing using **Zod** schemas from `@finance/shared-schemas`
- Validate at API boundary (Hono middleware with `@hono/zod-validator`)
- Fail fast with clear error messages
- Never trust external data (API responses, user input, file content)

## Code Intelligence (CRITICAL)

- **Think before you edit**: Use GitNexus to understand the blast radius of your changes.
- **Impact Analysis**: Mandatory `mcp_gitnexus_impact` on any shared utility, service method, or repository function.
- **Flow Verification**: Use `mcp_gitnexus_query` to ensure you are not breaking a multi-step execution flow.

## TypeScript Specifics

- **Zero tolerance for `any`** and `@ts-ignore`
- Use `unknown` for external input, then narrow safely
- Prefer `type` for unions, `interface` for object shapes
- Use `z.infer<typeof schema>` for validated data types

## Code Quality Checklist

Before marking work complete:
- [ ] No `any`, `@ts-ignore`
- [ ] Functions are small (<50 lines)
- [ ] Files are focused (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Financial calculations use `Decimal.js`
- [ ] Proper error handling with typed errors
- [ ] No hardcoded values (use constants or config)
- [ ] No mutation (immutable patterns used)
- [ ] Inputs validated with Zod schemas
- [ ] **Impact analysis performed via GitNexus**
```

### Giải thích các thay đổi chính

| Thay đổi | Lý do |
|----------|-------|
| **Thêm phần "Financial Precision"** | Đây là yêu cầu cốt lõi của dự án tài chính, phải được đặt lên hàng đầu. |
| **Thêm ví dụ `Decimal.js`** | Giúp AI và developer biết chính xác cách xử lý tiền tệ. |
| **Đề cập đến `pino` logging** | Phù hợp với cấu trúc logging hiện tại trong `apps/api/src/lib/logger.ts`. |
| **Nhấn mạnh Zod và `@finance/shared-schemas`** | Đảm bảo validation tập trung, nhất quán toàn dự án. |
| **Thêm mục TypeScript Specifics** | Củng cố quy tắc "no any", sử dụng `unknown` và type inference từ Zod. |
| **Cập nhật checklist** | Bổ sung các mục liên quan đến tài chính và TypeScript. |

