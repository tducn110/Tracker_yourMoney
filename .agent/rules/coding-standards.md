---
trigger: always_on
---

# ⚙️ Coding Standards (S2S Finance V3)

As an expert AI agent (Antigravity V1.2), you must strictly adhere to these coding standards for the Finance Tracker V3 project.

## 1. 🛡️ TECHNICAL GUARDRAILS (THE CONSTITUTION)

### 💰 1.1 DECIMAL PRECISION (NO FLOATS)
- **Violation**: NEVER use direct `+ - * /` operators or `number` type for currency.
- **Law**: Use **`Decimal.js`** for all arithmetic. All monetary values MUST be transferred as `string` between Backend and Frontend to prevent precision loss.

### 📖 1.2 IMMUTABLE LEDGER (SOFT DELETE)
- **Violation**: No hard `DELETE` or `UPDATE` on historical transactions.
- **Law**: Implement **Soft Delete** (`deleted_at` column). Every change must be an "Entry" to preserve the Audit Log and Safe-to-Spend (S2S) integrity.

### ⚡ 1.3 COLD START RESILIENCE (OPTIMISTIC UI)
- **Violation**: UI must not wait for TiDB Serverless's cold start latency (2-3s).
- **Law**: Mandatory **Optimistic UI** (TanStack Query). UI updates S2S immediately. Implement a robust **Rollback** mechanism if the Server responds with an error.

### 📴 1.4 CASH WALLET SYNC (OFFLINE-FIRST)
- **Violation**: Cash transactions should not require a stable network.
- **Law**: Use **LocalStorage Sync** for the Cash Widget. Implement a **Reconciliation** logic to resolve conflicts between Local and DB states upon reconnection.

---

## 2. Shared Logic & Types (Monorepo Strictness)
- **Independent Package**: ALL Zod schemas, shared types, and common utilities MUST live in `packages/shared-schemas/`.
- **Pre-Implementation Rule**: Define the `Zod Schema` **FIRST** before writing any API logic or services.
- **S2S Integration**: Use `hono/client` to maintain full end-to-end type safety.

## 3. UI & Aesthetics (Antigravity Standard)
- **Modern Design**: Use vibrant colors, glassmorphism, and dynamic animations (Apple/Linear style).
- **Visual Excellence**: Avoid browser defaults. Use modern typography (Google Fonts like Inter or Outfit) and smooth gradients.

## 4. Security & Data Integrity (Zero-Trust)
- **Authentication**: Use **HttpOnly Cookies** for JWT storage with `SameSite=Lax`. No tokens in LocalStorage. 
- **Database**: Ensure queries always scope by `user_id` (application-level RLS). Use Drizzle's parameterized queries to prevent SQL injection.

## 5. Development Tools
- **Code Intelligence**: Use **GitNexus** for all codebase exploration, impact analysis, and flow tracing.
- **Logging**: Use structured JSON logging (`pino`).
- **Database Migrations**: Always use Drizzle-kit for migrations (`pnpm db:generate` → `pnpm db:migrate`).

---
*CRITICAL REMINDER: Read this constitution before every development step.*