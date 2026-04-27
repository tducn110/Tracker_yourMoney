# 🚀 Phase-by-Phase Deployment Plan (Finance Tracker)

This plan integrates the **GitHub Feature Development Workflow** with the **Vercel/TiDB Deployment Procedure** to ensure safe, precision-first releases.

## Phase 1: Feature Isolation & Local Validation
*Goal: Ensure the feature is complete and passes all local quality gates.*

1. **Issue & Branching**:
   - Create a GitHub issue and a topic branch: `feature/issue-<ID>-<description>`.
2. **Implementation**:
   - Follow TDD and coding standards (no `any`, `Decimal.js` for money).
3. **Local QA**:
   - Run `pnpm typecheck`, `pnpm lint`, and `pnpm test`.
   - 100% coverage mandatory for financial functions.
4. **Impact Detection**:
   - Run `mcp_gitnexus_detect_changes()` to verify the blast radius.

## Phase 2: Database Schema Sync (TiDB Serverless)
*Goal: Prepare the production database for new application logic.*

1. **Migration Generation**:
   ```bash
   cd packages/db
   pnpm db:generate
   ```
2. **Migration Review**:
   - Inspect the generated SQL in `packages/db/drizzle/`.
3. **Production Migration**:
   - Ensure `DATABASE_URL` points to the production TiDB instance.
   ```bash
   pnpm db:migrate
   ```
   > [!IMPORTANT]
   > Never use `db:push` on production. Always use versioned migrations.

## Phase 3: Integration & Preview Build
*Goal: Merge changes into the development pipeline and verify in a cloud environment.*

1. **Rebase**:
   - Sync with latest `dev`: `git fetch origin && git rebase origin/dev`.
2. **Pull Request**:
   - Push to origin and create a PR to the `dev` branch.
3. **Vercel Preview**:
   - Vercel will automatically build a preview deployment.
   - Verify that the preview build succeeds and the URL is accessible.

## Phase 4: Production Release (Main Branch)
*Goal: Deploy the verified changes to the live production environment.*

1. **Merge to Dev**:
   - Once approved, use **Rebase and Merge** on GitHub to integrate into `dev`.
2. **Merge to Main**:
   - When `dev` is stable, merge into `main` to trigger the production deployment.
   ```bash
   git checkout main
   git merge dev --no-ff
   git push origin main
   ```
3. **Vercel Production Build**:
   - Monitor the deployment progress in the Vercel Dashboard.

## Phase 5: Post-Deployment Verification
*Goal: Confirm system health and financial integrity in production.*

1. **Health Checks**:
   - Verify `GET /api/v1/health` returns 200 OK.
2. **Financial Precision Audit**:
   - Check Dashboard Budget numbers to ensure no floating-point errors occurred.
3. **Idempotency Check**:
   - Verify that duplicate transaction submissions (with same `Idempotency-Key`) return 409.
4. **Performance Audit**:
   - Run a Google Lighthouse audit on the production URL.

## Phase 6: Maintenance & Logging
*Goal: Monitor for regressions and document the update.*

1. **Error Monitoring**:
   - Check Vercel logs and `pino` structured logs for unexpected 500 errors.
2. **Roadmap Update**:
   - Mark completed milestones in `ROADMAP.md` or the project board.
