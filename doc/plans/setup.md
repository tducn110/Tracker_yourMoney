# 🚀 S2S Finance V3 - Setup Guide

Welcome to the **S2S Finance V3** project! This guide will help you get your local development environment up and running in minutes.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: `v18.x` or higher (Recommend `v20+`)
- **pnpm**: `v9.x` or higher (Mandatory for monorepo management)
- **Docker**: Optional (Only if you want to run a local database via `docker-compose`)
- **TiDB Serverless**: Account/Cluster (Recommended for production-parity)

---

## 📥 Getting Started

### 1. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd finance-for-me-local

# Install dependencies for the entire monorepo
pnpm install
```

### 2. Environment Configuration

Copy the example environment file and update it with your credentials:

```bash
cp .env.example .env
```

> [!IMPORTANT]
> Open the `.env` file and fill in your `DATABASE_URL` and `JWT_SECRET`.
> You can get your connection string from the **TiDB Cloud Console**.

### 3. Database Initialization

The project uses **Drizzle ORM**. You need to generate the migrations and push the schema to your database.

```bash
# Generate migrations based on the schema
pnpm db:generate

# Push the schema to the database (use push for dev, migrate for prod)
pnpm db:push
```

---

## ⚡ Development Workflow

Launch the entire ecosystem (Web & API) with a single command:

```bash
pnpm dev
```

### Accessing the Apps

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend** | [http://localhost:3000](http://localhost:3000) | Next.js Dashboard |
| **API** | [http://localhost:3001](http://localhost:3001) | Hono.js Backend |
| **DB Studio** | [http://localhost:4983](http://localhost:4983) | Drizzle Studio (Run `pnpm db:studio`) |

---

## 📂 Project Structure

This is a monorepo powered by **Turborepo**:

- `apps/web`: Next.js frontend with Tailwind CSS v4 & motion.
- `apps/api`: Hono.js backend (Edge-compatible).
- `packages/db`: Drizzle schema and repository patterns.
- `packages/shared-schemas`: Shared Zod validation schemas.
- `packages/api-client`: Typed API client shared between apps.

---

## 🧪 Common Commands

| Command | Action |
| :--- | :--- |
| `pnpm lint` | Run ESLint across all packages |
| `pnpm typecheck` | Run TypeScript verification |
| `pnpm test` | Execute Vitest unit and integration tests |
| `pnpm build` | Build all apps for production |

---

## 🆘 Troubleshooting

### Port Conflicts
If port `3000` or `3001` is already in use, run:
```bash
npx kill-port 3000 3001
```

### TiDB Cold Start
If the API is slow on the first request, it's likely a TiDB Serverless cold start. This is expected in the development tier.

### TypeScript Errors
Ensure you are running the latest version of pnpm and that you've run `pnpm install` at the root. If errors persist, try:
```bash
pnpm typecheck
```

---

> [!TIP]
> Always check the [Coding Standards](./doc/wiki/QUICKSTART.md) before making changes to financial calculations. We use `Decimal.js` for 100% precision!
