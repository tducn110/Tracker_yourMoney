# Finance Tracker — The Purified Budget-First App

A robust, high-performance personal finance management system built with a **Budget-First** philosophy. Designed for the Edge, hardened for accuracy.

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS, TanStack Query.
- **Backend**: Hono API (Cloudflare Workers/Node.js compatible).
- **Database**: TiDB Serverless (MySQL-compatible distributed SQL).
- **ORM**: Drizzle ORM.
- **Auth**: Firebase Authentication (Session Cookies).
- **Precision**: Decimal.js for all monetary calculations.

## 🏗️ Monorepo Structure

- `apps/api`: Hono-based REST API with Service Layer & DI Container.
- `apps/web`: Next.js dashboard with Optimistic UI.
- `packages/db`: Drizzle schema, migrations, and repositories.
- `packages/shared-schemas`: Zod validation schemas shared between API and Web.
- `packages/api-client`: Typed API client for the frontend.

## ⚙️ Core Principles

1. **Financial Integrity**: 
   - No floating-point math for money.
   - All financial mutations (Bills, Goals) automatically create ledger entries (`transactions`).
   - Atomic transactions for all multi-table updates.
2. **Serverless Ready**:
   - Zero `fs` dependencies in the API.
   - Stateless request handlers.
   - Optimized for low cold-start latency.
3. **Data Safety**:
   - Soft-delete strategy for all financial records.
   - Idempotency keys required for all mutations to prevent duplicate processing.
   - 100% Zod validation at every system boundary.

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- TiDB Serverless instance

### Installation
```bash
pnpm install
```

### Environment Setup
Copy `.env.example` to `.env.local` and fill in:
- `DATABASE_URL` (TiDB Connection String)
- `FIREBASE_*` credentials
- `JWT_SECRET`
- `E2E_ADMIN_SECRET`

### Database Management
```bash
cd packages/db
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Apply migrations
pnpm db:seed      # Seed demo data
```

### Development
```bash
pnpm dev
```

## 🧪 Quality Assurance

- **Typecheck**: `pnpm typecheck`
- **Lint**: `pnpm lint`
- **Audit**: `pnpm db:status` to check infrastructure health.

---
*Built with ❤️ by Antigravity V1.2*
