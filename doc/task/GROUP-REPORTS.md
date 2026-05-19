<!-- Verified against current repo files and GitHub metadata on 18/05/2026 -->

# Finance Tracker V3 — Final Project Report

## Team Information

| Field | Value |
| --- | --- |
| **Team Name** | proPlayer |
| **Project Name** | Finance Tracker V3 — Personal Finance Management Application |
| **GitHub Repository** | https://github.com/tducn110/Tracker_yourMoney |
| **Primary Deploy Evidence** | Latest successful Vercel Production deployment on 16/05/2026: `https://finance-for-me-local-n2q6yvmiw-ntduc011006dn-3691s-projects.vercel.app` |
| **Secondary Deploy Evidence** | Latest successful GitHub Pages deployment on 16/05/2026: `https://tducn110.github.io/Tracker_yourMoney/` |
| **Video Demo** | https://www.youtube.com/watch?v=zAD1gF02NrU |
| **Submission Date** | 15/05/2026 |

### Team Members

The repository history clearly shows three primary student contributors plus a small amount of Claude-authored support commits. Student IDs below come from the team-provided GitHub report content and should still match the final submission roster.

| Member | Git Evidence | Verified Contribution Signal | Student ID |
| --- | --- | --- | --- |
| Nguyen Tam Duc | `tducn`, `tdu._cn`, `tducn110` | Project lead, monorepo setup, backend/API architecture, auth, deployment, final integration | 24020005 |
| Tran Vo Ba Vuong | `ViccVuongVicc`, `tvbavuong@gmail.com` | Large share of merged UI/refactor work and recent accessibility/PageSpeed work | 24020008 |
| Chau Tuan Kiet | `kiet00394-collab`, `Chau Tuan Kiet` | Backend and onboarding-related feature work, automation-related merges | 24020010 |

---

## Project Overview and Technologies Used

### Application Description

Finance Tracker V3 is a budget-first personal finance application built as a pnpm/Turborepo monorepo. The current codebase supports user onboarding, wallet management, transactions, budgets, recurring bills, savings goals, analytics, notifications, and authenticated settings flows. The architecture separates a Next.js App Router frontend (`apps/web`) from a Hono API package (`apps/api`) while sharing database schema and validation logic through workspace packages.

### Verified Tech Stack

The current codebase is the source of truth for this section. Some older docs still mention Next.js 15 and TiDB/MySQL, but the active package and schema files now show the stack below.

| Layer | Verified Technology |
| --- | --- |
| Frontend | Next.js `16.1.4`, React `19.2.5`, TypeScript `6.0.3`, Tailwind CSS `4.2.4`, TanStack Query, Radix UI, shadcn/ui-style component set under `apps/web/src/components/ui`, Motion, Recharts |
| Backend | Hono `4.12.14`, Zod `4.3.6`, Firebase Auth/Admin, `jose`, `pino`, optional `@sentry/node` |
| Database | Supabase PostgreSQL per `ARCHITECTURE.md`, implemented in code as PostgreSQL dialect via Drizzle ORM `0.45.2`, `pg-core`, `drizzle-kit` |
| Monorepo Tooling | pnpm `9.12.3`, Turborepo `2.9.6`, ESLint `9`, GitNexus index for code intelligence |
| Shared Packages | `@finance/api`, `@finance/api-client`, `@finance/db`, `@finance/shared-schemas`, `@finance/cache` |
| Deployment | Vercel serverless deployment for the web app and embedded Hono API, plus GitHub Pages deployment records in repo history |

### Monorepo Structure

| Path | Purpose |
| --- | --- |
| `apps/web` | Next.js App Router frontend |
| `apps/api` | Hono API, middleware, route modules, logging, auth, instrumentation |
| `apps/worker` | Background/worker package present in workspace |
| `packages/db` | Drizzle schema, migrations, repositories, DB scripts |
| `packages/shared-schemas` | Zod schemas shared across layers |
| `packages/api-client` | Typed frontend API client |
| `packages/cache` | Shared cache utilities |

### Key Features Verified in the Current Codebase

- Authenticated login flow with Firebase-backed auth and `/api/auth/*` session endpoints.
- Onboarding wizard at `/onboarding`.
- Dashboard at `/` with quick-add entry points, financial overview, and linked data widgets.
- Budget management, including budget detail pages and category-linked allocations.
- Transactions list with filtering, sorting, pagination-oriented API usage, CSV import, and quick-add flows.
- Multi-wallet management, cash wallet shortcuts, transfers, and wallet audit logging support.
- Recurring bills with payment endpoint support.
- Savings goals with contribution flow.
- Analytics for category spending and monthly trend.
- Notifications and user settings endpoints.
- Optional server-side Sentry instrumentation and structured pino logging.

### Submission Assets Verified

- Final screenshots for key pages are stored under `doc/screenshots/` and referenced in the root `README.md`.
- Responsive proof screenshots are stored under `doc/screenshots/`.
- Video demo link is listed in the root `README.md`: <https://www.youtube.com/watch?v=zAD1gF02NrU>.
- `ARCHITECTURE.md` and `doc/wiki/ARCHITECTURE.md` do exist in the current repository and can be cited as supporting design documentation.

<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:12px">
  <div><img src="../screenshots/Screenshot 2026-05-17 at 14.47.07.png" alt="Dashboard screenshot" style="width:100%;border-radius:8px" /><p align="center">Dashboard</p></div>
  <div><img src="../screenshots/Screenshot 2026-05-17 at 14.49.23.png" alt="Transactions screenshot" style="width:100%;border-radius:8px" /><p align="center">Transactions</p></div>
  <div><img src="../screenshots/Screenshot 2026-05-17 at 14.49.35.png" alt="Wallets screenshot" style="width:100%;border-radius:8px" /><p align="center">Wallets</p></div>
  <div><img src="../screenshots/Screenshot 2026-05-17 at 14.49.45.png" alt="Budgets screenshot" style="width:100%;border-radius:8px" /><p align="center">Budgets</p></div>
</div>

---

## Setup and Run Instructions

### System Requirements

| Tool | Requirement |
| --- | --- |
| Node.js | `>=18`, with Node 20+ recommended by project docs |
| pnpm | `9.12.3` |
| Database | PostgreSQL database via `DATABASE_URL`; architecture docs identify the target service as Supabase PostgreSQL |
| Firebase | Client and Admin credentials for auth flows |
| Optional | Vercel CLI for manual deployment workflows |

### Verified Local Commands

```bash
git clone https://github.com/tducn110/Tracker_yourMoney.git
cd Tracker_yourMoney
pnpm install

# Configure environment
cp .env.example .env.local

# Database workflow from root package.json
pnpm db:generate
pnpm db:push

# Start local development
pnpm dev

# Quality checks
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

### Configuration Notes

- The root workspace scripts in `package.json` are more up to date than some older README/doc fragments.
- In local development, the Next.js frontend runs separately from the Hono server.
- In production on Vercel, `apps/web/src/app/api/[[...route]]/route.ts` embeds the Hono app directly into the Next.js deployment as a Node.js serverless route.
- The active Drizzle schema uses PostgreSQL types from `drizzle-orm/pg-core`.

---

## Task 1 - Project Planning & Teamwork

### (a) Role Assignment

The role split below is based on contributor identities, merged PR history, and commit messages. It should be treated as evidence-backed project attribution, not a substitute for each member’s official self-report.

| Member | Role Summary | Evidence |
| --- | --- | --- |
| Nguyen Tam Duc | Team lead, architecture, backend integration, auth, deployment, final integration | Git identities `tducn`, `tdu._cn`, repo owner `tducn110`, setup/deployment/auth-related PRs and commits |
| Tran Vo Ba Vuong | Frontend refactor, UI implementation, accessibility/PageSpeed, merged feature branches | Git identity `ViccVuongVicc`, strong presence in merged PRs and commit totals |
| Chau Tuan Kiet | Backend/onboarding support, feature implementation, automation-related work | Git identity `kiet00394-collab`, onboarding and feature branch activity |

### (b) Wireframe

- Tool used: Figma.
- Design coverage listed in the root `README.md`: Dashboard, Transactions, Wallets, Budgets, Goals, Bills, Analytics, Settings, and Onboarding.
- The implemented page set is also verified directly from the App Router structure.

<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:12px">
  <div><img src="../screenshots/Screenshot from 2026-05-17 21-28-54.png" alt="AI Quick Add design proof" style="width:100%;border-radius:8px" /><p align="center">AI Quick Add</p></div>
  <div><img src="../screenshots/Screenshot from 2026-05-17 21-29-59.png" alt="Onboarding design proof" style="width:100%;border-radius:8px" /><p align="center">Onboarding Wizard</p></div>
</div>

### (c) Project Plan

The table below reflects the team’s planned milestone schedule. GitHub timestamps are still useful as implementation evidence, but they should not replace the original planned timeline because many tasks were updated, fixed, and merged multiple times after the initial implementation window.

| Milestone | Deadline | Status |
| --- | --- | --- |
| Complete wireframe & Figma design | 10/04/2026 | Planned milestone from team report |
| Setup GitHub, monorepo, and database schema | 15/04/2026 | Planned milestone from team report |
| Complete authentication (Firebase + JWT) | 18/04/2026 | Planned milestone from team report |
| Basic UI (Dashboard, Transactions, Wallets) | 22/04/2026 | Planned milestone from team report |
| Database integration & full CRUD API | 28/04/2026 | Planned milestone from team report |
| AI Quick Add, Analytics, Bills, Goals | 05/05/2026 | Planned milestone from team report |
| Onboarding Wizard, Optimization & Peer Review | 12/05/2026 | Planned milestone from team report |
| Submission | 15/05/2026 | Planned milestone from team report |

### (d) GitHub Repository

- Repository: `https://github.com/tducn110/Tracker_yourMoney`
- Default working branch in local repo: `main`
- Branch strategy visible in history: feature branches named `feature/issue-*`, targeted fix branches named `fix/*`, plus merge back into `main`
- GitNexus context from `AGENTS.md`: repo indexed as `Tracker_yourMoney`

### (e) GitHub Workflow

- The project uses PR-based integration rather than long-lived direct commits to `main` for most major work.
- Branch names follow a consistent pattern such as `feature/issue-149-ai-quick-add`, `feature/issue-151-dashboard-refactor`, `fix/102-detailed-error-ux`, and `fix/accessibility-page-speed`.
- Commit and PR naming broadly follow Conventional Commit style with prefixes such as `feat`, `fix`, `docs`, `chore`, and `refactor`.
- The visible contributor set in git history includes three primary student contributors and a small set of Claude support commits.
- GitHub still has a non-trivial open backlog. The current open issues sample includes layout/navigation, dashboard, transactions, budgets, goals, bills, wallets, settings, categories/notifications, analytics, testing, AI, caching, and responsive polish issues. The latest `gh issue list --state open --limit 100` output returned 32 open issues, including `#165`, `#164`, `#128` to `#117`, `#75`, `#73` to `#69`, `#68` to `#65`, `#61`, `#60`, `#57`, `#56`, `#55`, `#49`, `#45`, and `#44`.

### (f) Representative Evidence

```text
#168 [FIX] PageSpeed audit — a11y, contrast, heading hierarchy, console errors
#159 feat: onboarding wizard 4 buoc - info, wallet, budget, transaction
#150 feat(api,web): AI Quick Add & Gemini Integration
#145 [FIX] Fix Vercel deployment: embed Hono API as Next.js catch-all route (#144)
#116 fix: remove broken ignoreCommand and improve error UX (#102)
#94  [FIX] Financial logic integrity and PostgreSQL synchronization (#93)
```

---

## Task 2 - Implement User Interface

### (a) Pages Built

| Route | Purpose | Verification |
| --- | --- | --- |
| `/login` | Login page | `apps/web/src/app/(auth)/login/page.tsx` |
| `/onboarding` | Multi-step onboarding flow | `apps/web/src/app/(auth)/onboarding/page.tsx` |
| `/` | Dashboard | `apps/web/src/app/(dashboard)/page.tsx` |
| `/transactions` | Transactions page | `apps/web/src/app/(dashboard)/transactions/page.tsx` |
| `/budgets` | Budgets list | `apps/web/src/app/(dashboard)/budgets/page.tsx` |
| `/budgets/[id]` | Budget detail | `apps/web/src/app/(dashboard)/budgets/[id]/page.tsx` |
| `/wallets` | Wallet management | `apps/web/src/app/(dashboard)/wallets/page.tsx` |
| `/goals` | Goals page | `apps/web/src/app/(dashboard)/goals/page.tsx` |
| `/bills` | Bills page | `apps/web/src/app/(dashboard)/bills/page.tsx` |
| `/analytics` | Analytics page | `apps/web/src/app/(dashboard)/analytics/page.tsx` |
| `/settings` | Settings page | `apps/web/src/app/(dashboard)/settings/page.tsx` |
| `/dev-guide` | Internal UI/dev guide page | `apps/web/src/app/(dashboard)/dev-guide/page.tsx` |
| `/api/[[...route]]` | Catch-all API bridge | `apps/web/src/app/api/[[...route]]/route.ts` |

### (b) Tailwind CSS Usage

- Tailwind CSS `4.2.4` is installed in `apps/web/package.json`.
- The frontend also uses Radix UI, a shadcn/ui-style component layer under `apps/web/src/components/ui`, MUI packages, Motion, Sonner, and Recharts.
- The root layout metadata currently identifies the app as `Finance Tracker V3` with Vietnamese description text.
- The internal codebase shows a utility-class workflow rather than a separate CSS module-heavy approach.

### (c) Interactive Features

| Feature | Evidence in Code |
| --- | --- |
| Quick add inputs and chat-style variants | `apps/web/src/components/quick-add/*` |
| Budget overview cards, grid, and modal CRUD UI | `apps/web/src/components/budgets/*` |
| Transactions container with filter/sort/import flow | `apps/web/src/app/(dashboard)/transactions/_components/TransactionsContainer.tsx` |
| Wallet cards, cash wallet widgets, and sync modal | `apps/web/src/components/wallet/*` |
| Category manager | `apps/web/src/components/CategoryManager.tsx` |
| Bills container/view | `apps/web/src/app/(dashboard)/bills/_components/*` |
| Goals container/view | `apps/web/src/app/(dashboard)/goals/_components/*` |
| Analytics container/view | `apps/web/src/app/(dashboard)/analytics/_components/*` |
| Auth context/provider | `apps/web/src/app/context/AuthProvider.tsx` |
| Onboarding wizard | `apps/web/src/components/onboarding/wizard.tsx` |

### (d) Multi-Device Interface

- Responsive intent is supported by the presence of mobile-first Tailwind usage and the existence of dedicated dashboard/layout pages.
- Responsive proof screenshots are attached below for desktop, tablet, and mobile-sized layouts.

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-top:12px">
  <div><img src="../screenshots/Screenshot from 2026-05-17 21-11-49.png" alt="Desktop responsive screenshot" style="width:100%;border-radius:8px" /><p align="center">Desktop</p></div>
  <div><img src="../screenshots/Screenshot from 2026-05-17 21-12-38.png" alt="Tablet responsive screenshot" style="width:100%;border-radius:8px" /><p align="center">Tablet</p></div>
  <div><img src="../screenshots/Screenshot from 2026-05-17 21-13-37.png" alt="Mobile responsive screenshot" style="width:100%;border-radius:8px" /><p align="center">Mobile</p></div>
</div>

---

## Task 3 - Database Integration & Dynamic Content

### (a) Database Design

The active schema is implemented in `packages/db/src/schema/*` and exported through `packages/db/src/schema/index.ts`. The current database model uses PostgreSQL-oriented Drizzle schema definitions, and `ARCHITECTURE.md` identifies the deployed database as Supabase PostgreSQL.

**Verified table set: 14 tables**

| Table | Purpose |
| --- | --- |
| `users` | User accounts and onboarding/auth profile state |
| `user_settings` | Financial preferences, locale, budget settings, notifications |
| `refresh_tokens` | Session/refresh token persistence |
| `categories` | Income and expense categories |
| `wallets` | Multi-wallet financial accounts |
| `wallet_logs` | Wallet balance audit trail |
| `transactions` | Core financial ledger |
| `bills` | Recurring bills |
| `bill_payments` | Bill payment history |
| `goals` | Savings goals |
| `budgets` | Budget definitions |
| `budget_categories` | Budget-to-category allocation mapping |
| `notifications` | In-app notifications |
| `audit_logs` | Mutation audit trail |

The ER diagram file does exist in the repository: `doc/wiki/erd.md`.

### (b) Database Connection

The current request/data flow is:

```text
Next.js UI
-> TanStack Query and workspace API client
-> /api/* on Next.js or local Hono server
-> Hono route modules + middleware
-> service layer
-> @finance/db repositories/schema
-> PostgreSQL-compatible database
```

Production routing is implemented by `apps/web/src/app/api/[[...route]]/route.ts`, which exports `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, and `OPTIONS` handlers from `hono/vercel` and runs them in the Node.js runtime.

### (c) Pages Displaying Dynamic Data

Based on `packages/api-client/src/endpoints.ts`, the frontend has typed client access to:

- `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/me`
- `/api/v1/user/settings`, `/api/v1/user/profile`, `/api/v1/user/onboarding/*`
- `/api/v1/budgets`, `/api/v1/budgets/summary`, `/api/v1/budgets/:id`
- `/api/v1/transactions`, `/api/v1/transactions/import`, `/api/v1/transactions/quick`
- `/api/v1/goals`, `/api/v1/goals/:id/contribute`
- `/api/v1/bills`, `/api/v1/bills/:id/pay`
- `/api/v1/analytics/category-spending`, `/api/v1/analytics/monthly-trend`
- `/api/v1/wallet`, `/api/v1/wallet/cash`, `/api/v1/wallet/transfer`
- `/api/v1/notifications`, `/api/v1/notifications/unread-count`, read/mark-all endpoints
- `/api/v1/categories`

### (d) Dynamic Pages and Data Sources

| Page | Dynamic Data Examples |
| --- | --- |
| Dashboard | Budgets summary, transactions, goals, bills, wallet data, quick-add results |
| Transactions | Transaction list, search/filter params, CSV import, quick-add mutation |
| Budgets | Budget list, summary, detail by ID |
| Wallets | Wallet list, cash wallet data, transfer actions |
| Goals | Goal list and contribution mutations |
| Bills | Bill list and pay-bill mutation |
| Analytics | Category spending and monthly trend |
| Settings | User settings and profile state |
| Onboarding | Onboarding status and completion flow |

---

## Task 4 - Optimization

### (a) Performance Check with Lighthouse

Lighthouse before/after evidence is stored under `doc/screenshots/` and summarized in the root `README.md`. The recorded score improved from **75** before optimization to **92** after optimization.

**Verified optimization and hardening work**

| Area | Evidence |
| --- | --- |
| Error UX | PR `#116` improved detailed error handling and removed broken command behavior |
| Auth race condition | PR `#114` added a guard in `AuthProvider` for social login flow |
| Rate limit response consistency | PR `#113` added `success: false` for HTTP 429 responses |
| Auth endpoint rate-limit tuning | PR `#112` raised auth rate limit to `30 req/min` |
| Production auth debugging | PR `#111` added step tracking for social auth debugging |
| Cold-start cleanup | PR `#110` removed dead imports and redundant env initialization |
| Dynamic Vercel CORS support | PR `#109` added `*.vercel.app` origin support |
| Vercel API deployment strategy | PR `#145` embedded Hono as a Next.js catch-all route |
| Budget/category seeding fixes | PRs `#147` and `#148` |
| Accessibility/PageSpeed | PR `#168` and commit `2297025` on 17/05/2026 |

**Lighthouse evidence**

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:12px">
  <div><img src="../screenshots/lighthouse-before.jpeg" alt="Lighthouse before optimization" style="width:100%;border-radius:8px" /><p align="center">Before optimization - 75</p></div>
  <div><img src="../screenshots/lighthouse-after.jpg" alt="Lighthouse after optimization" style="width:100%;border-radius:8px" /><p align="center">After optimization - 92</p></div>
</div>

### (b) Error Monitoring & User Behavior Tracking

- Backend Sentry instrumentation is present but optional.
- `apps/api/src/index.ts` loads `./instrument` only when `SENTRY_DSN` is set.
- The API stack uses pino-based structured logging, correlation IDs, and centralized error formatting.
- The codebase exposes `/api/v1/health` for a basic health response.
- The frontend Firebase config still includes `measurementId` support, but this repository alone does not prove active Google Analytics dashboards or tracked reports.

### (c) Deployment History Summary

GitHub deployment records confirm all three of the following:

| Environment | Latest Verified Success | URL |
| --- | --- | --- |
| Vercel Production | 16/05/2026 17:52 UTC | `https://finance-for-me-local-n2q6yvmiw-ntduc011006dn-3691s-projects.vercel.app` |
| Vercel Preview | 16/05/2026 17:50 UTC | `https://finance-for-me-local-dhxirty0l-ntduc011006dn-3691s-projects.vercel.app` |
| GitHub Pages | 16/05/2026 17:49 UTC | `https://tducn110.github.io/Tracker_yourMoney/` |

GitHub Pages deployment records also exist as early as 27/04/2026, which shows repeated deployment activity throughout the project timeline.

---

## Task 5 - UI/UX Peer Review & Evaluation

### (a) Verified Review Signals

The repository does contain evidence of internal review and revision through pull request flow, review requests, and follow-up fixes. Useful examples include:

- PR `#27` and PR `#32` requested review from `tducn110` during the early database/release phases.
- PR `#78`, `#110`, `#111`, `#113`, `#115`, `#140`, and `#159` also include visible `reviewRequests`.
- PR `#112`, `#113`, and `#114` show review involvement from both `tducn110` and `kiet00394-collab` during the auth hardening phase.
- PR `#162` reverted the fake-auth onboarding flow after integration review showed that it was not suitable for the real Firebase flow.
- PR `#168` is a final accessibility/PageSpeed cleanup pass after earlier UI and integration work had already landed.

### (b) External Team Feedback Status

- No repository-local artifact clearly proves cross-team UI/UX review exchange, such as screenshots, markdown notes, or issue links to another team’s repository.
- The safe evidence-based statement is that internal review activity is verifiable, while external peer-review artifacts are still missing from this local repository snapshot.
- If the course submission requires cross-team review proof, it should be attached separately rather than invented in this report.

---

## Deliverables Checklist

**Verified from codebase or GitHub**

- [x] Source repository exists and is active on GitHub.
- [x] Monorepo structure is clear and runnable from root scripts.
- [x] Core App Router pages exist for login, onboarding, dashboard, transactions, budgets, wallets, goals, bills, analytics, settings, and dev guide.
- [x] Typed API client and Hono route structure exist.
- [x] Drizzle schema and ERD file exist.
- [x] Deployment records exist for Vercel Preview, Vercel Production, and GitHub Pages.
- [x] Optimization/hardening PR history is visible and recent.

**Attached or still pending before final submission**

- [x] Final screenshots for key pages are present in the Final-Report site content.
- [x] Responsive screenshots for mobile/tablet/desktop are attached above.
- [x] Lighthouse before/after screenshots are attached above.
- [x] Video demo link is listed in the team information table.
- [x] Wireframe/design coverage is documented above with available visual proof.
- [ ] External cross-team peer-review evidence if the rubric requires it.
- [x] Student self-report files exist under `doc/self-report/`.
- [x] Official team name and student IDs provided by the team report.
- [x] Official submission date provided by the team report.

---

## Self-Report

The current local checkout does contain self-report files:

```text
doc/self-report/self-report-24020005.md
doc/self-report/self-report-24020008.md
doc/self-report/self-report-24020010.md
```

These files should stay aligned with the final deployed report content.

---

## Actionable Fill-In List

To finish this report without re-researching GitHub:

1. Team name, student IDs, and submission date have been filled from the team-provided GitHub report content.
2. Keep the inserted screenshots aligned with the final deployed app.
3. Keep the YouTube demo URL in the top metadata table up to date.
4. Replace the design proof screenshots with exported Figma frames if stricter rubric evidence is required.
5. Add cross-team peer-review artifacts if they exist outside the repository.
6. Keep the self-report files synchronized with the final deployed report site.
7. Keep the Lighthouse screenshots synchronized with the final production URL if the rubric requires a fresh audit.

---

## Appendix - Codebase Evidence

### Key Local Evidence Files

| File | Why It Matters |
| --- | --- |
| `package.json` | Current workspace scripts and tooling versions |
| `apps/web/package.json` | Frontend versions and UI dependencies |
| `apps/api/package.json` | Backend versions and Sentry dependency |
| `apps/web/src/app/layout.tsx` | App metadata |
| `apps/web/src/app/api/[[...route]]/route.ts` | Vercel deployment architecture |
| `apps/api/src/index.ts` | Middleware, logging, CORS, route mounting, health route |
| `packages/api-client/src/endpoints.ts` | Typed endpoint inventory |
| `packages/db/src/schema/index.ts` | Exported schema modules |
| `packages/db/src/schema/*.ts` | Table definitions and constraints |
| `doc/wiki/erd.md` | Existing ERD file |
| `ARCHITECTURE.md` | Repository-level architecture write-up |
| `doc/wiki/ARCHITECTURE.md` | Additional architecture documentation |

### Main API Route Map

```text
/api/auth
/api/v1/wallet
/api/v1/analytics
/api/v1/transactions
/api/v1/bills
/api/v1/categories
/api/v1/goals
/api/v1/budgets
/api/v1/user
/api/v1/notifications
/api/v1/ai
/api/v1/health
```

### Important Source Files

| File | Role |
| --- | --- |
| `apps/web/src/app/(dashboard)/page.tsx`                                           | Dashboard layout                              |
| `apps/web/src/app/(dashboard)/transactions/_components/TransactionsContainer.tsx` | Transaction search/filter/sort/import/export  |
| `apps/web/src/app/(dashboard)/budgets/page.tsx`                                   | Budget CRUD UI                                |
| `apps/web/src/app/(dashboard)/wallets/page.tsx`                                   | Wallet management UI                          |
| `apps/web/src/app/api/[[...route]]/route.ts`                                      | Next.js to Hono API bridge on Vercel          |
| `apps/api/src/index.ts`                                                           | Hono app, middleware, routing, error handling |
| `packages/api-client/src/endpoints.ts`                                            | Typed endpoint client                         |
| `packages/db/src/schema/*.ts`                                                     | Drizzle database schema                       |
| `packages/shared-schemas/src/*.ts`                                                | Zod validation schemas                        |
| `doc/wiki/erd.md`                                                                 | ERD Mermaid                                   |

### Key GitHub Evidence Used

- Merged PR history from `gh pr list --state merged --limit 100`
- Open issue sample from `gh issue list --state open --limit 100`
- Deployment records from `gh api repos/tducn110/Tracker_yourMoney/deployments?per_page=100`
- Deployment statuses for the latest Vercel Production, Vercel Preview, and GitHub Pages records
