---
description: S2S Finance Deployment Workflow
---

# 🚀 Deployment Workflow (S2S Finance)

This workflow outlines the standard procedure for deploying the S2S Finance V3 project using Vercel and TiDB Serverless.

## 1. Pre-Deployment Checks

Ensure all code passes quality gates.

```bash
# Run from monorepo root
pnpm typecheck
pnpm lint
pnpm test
```

## 2. Database Migration (TiDB Serverless)

Always ensure database schema is up-to-date before deploying API changes.

```bash
# Navigate to the database package
cd packages/db

# Generate migration files from Drizzle schema changes
pnpm db:generate

# Apply migrations to production database
# IMPORTANT: Ensure DATABASE_URL is set to production TiDB instance
pnpm db:migrate
```

> ⚠️ **Never use `db:push` on production.** Always use `db:migrate` for production deployments.

## 3. Build Verification

Build the entire monorepo to catch any build-time errors.

```bash
# From monorepo root
pnpm build
```

## 4. Deploy to Vercel

The project is configured for Vercel deployment with the following structure:
- **API**: `apps/api` (Hono on Vercel Edge Functions)
- **Web**: `apps/web` (Next.js 16)

```bash
# Deploy to production
vercel --prod

# Or deploy via GitHub integration (recommended)
# Push to `main` branch triggers automatic deployment
```

## 5. Post-Deployment Verification

Verify the live environment:

- [ ] **Health Check**: `GET https://api.yourdomain.com/api/v1/health`
- [ ] **Auth Check**: Confirm HttpOnly cookie auth is working (login/logout flow)
- [ ] **S2S Calculation**: Verify `DECIMAL` precision on Dashboard
- [ ] **Cold Start**: Monitor for 503/504 errors on first request after deploy
- [ ] **Idempotency**: Test duplicate transaction submission returns 409

## 6. Rollback Procedure

If critical issues are detected:

```bash
# Rollback to previous deployment
vercel rollback

# Or manually redeploy previous commit
vercel --prod --scope <team> <previous-deployment-url>
```

## Environment Variables (Vercel)

Ensure the following environment variables are set in Vercel project settings:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | TiDB Serverless connection string (HTTP format) |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `E2E_ADMIN_SECRET` | Internal API secret for seeding/teardown |
| `NEXT_PUBLIC_API_URL` | Public API URL for frontend |
| `INTERNAL_API_URL` | Internal API URL for server-side fetch |