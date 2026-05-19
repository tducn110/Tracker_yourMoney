# Finance Tracker V3 — Final Project Report

## Team Information

| Field                 | Value                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------- |
| **Team Name**         | Antigravity                                                                            |
| **Project Name**      | Finance Tracker V3 — Personal Finance Management App                                   |
| **GitHub Repository** | [github.com/tducn110/Tracker_yourMoney](https://github.com/tducn110/Tracker_yourMoney) |
| **Demo Deploy**       | [finance-for-me-local.vercel.app](https://finance-for-me-local.vercel.app)             |
| **Video Demo**        | [youtube.com/watch?v=zAD1gF02NrU](https://www.youtube.com/watch?v=zAD1gF02NrU)         |
| **Submission Date**   | 15/05/2026                                                                             |

### Team Members

| Full Name        | Student ID | Role                                          |
| ---------------- | ---------- | --------------------------------------------- |
| Nguyen Tam Duc   | 24020005   | Team Lead / Backend / Database / Architecture |
| Tran Vo Ba Vuong | 24020008   | Backend / Auth / Middleware / DevOps / Worker |
| Chau Tuan Kiet   | 24020010   | Frontend / UI-UX / Dashboard / Components     |

## Individual Self-Reports

| Team Member      | Student ID | Self-Report                                                     |
| ---------------- | ---------- | --------------------------------------------------------------- |
| Nguyen Tam Duc   | 24020005   | [Nguyen Tam Duc self-report](/self-reports/nguyen-tam-duc/)     |
| Tran Vo Ba Vuong | 24020008   | [Tran Vo Ba Vuong self-report](/self-reports/tran-vo-ba-vuong/) |
| Chau Tuan Kiet   | 24020010   | [Chau Tuan Kiet self-report](/self-reports/chau-tuan-kiet/)     |

## Project Overview & Technologies Used

### Application Description

Finance Tracker V3 is a personal finance management application following the **Budget-First** philosophy, putting budgets at the center. The app helps users track income and expenses, manage multiple wallets, set category-based budgets, monitor recurring bills, set savings goals, and analyze spending habits through charts. It is targeted at individuals who want to manage their finances scientifically and accurately.

### Tech Stack

| Layer    | Technology                                                                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Radix UI, shadcn/ui, TanStack Query, Recharts, Motion                                 |
| Backend  | Hono API (Node.js), TypeScript, Zod, Firebase Auth/Admin, JWT, Pino logging                                                                           |
| Database | Supabase PostgreSQL, Drizzle ORM (14 tables)                                                                                                          |
| Auth     | Firebase Authentication (Google, Facebook, GitHub, Apple)                                                                                             |
| Monorepo | Turborepo + pnpm Workspace (`apps/api`, `apps/web`, `apps/worker`, `packages/db`, `packages/api-client`, `packages/shared-schemas`, `packages/cache`) |
| Deploy   | Vercel                                                                                                                                                |

### Key Features

- **Multi-Wallet:** Support for multiple wallets (cash, bank, credit card, e-wallet, investment) with inter-wallet transfers.
- **AI Quick Add:** Add transactions quickly using natural language such as `Breakfast 35k`, auto-detecting category and amount via Gemini AI.
- **Budget Management:** Set category budgets, track spending percentages, and receive overspend alerts.
- **Recurring Bills:** Track monthly, quarterly, and yearly bills, payment history, and reminders.
- **Savings Goals:** Set goals with deadlines, track progress, and fund directly from wallets.

#### Screenshots (Key Features)

![Feature screenshot 1](/screenshots/Screenshot%20from%202026-05-17%2021-28-54.png)
![Feature screenshot 2](/screenshots/Screenshot%20from%202026-05-17%2021-11-49.png)
![Feature screenshot 3](/screenshots/Screenshot%20from%202026-05-17%2021-12-38.png)
![Feature screenshot 4](/screenshots/Screenshot%20from%202026-05-17%2021-13-37.png)
![Feature screenshot 5](/screenshots/Screenshot%20from%202026-05-17%2021-14-38.png)

## Setup & Installation Guide

### System Requirements

| Tool       | Version          |
| ---------- | ---------------- |
| Node.js    | >= 20.x          |
| pnpm       | >= 9.x           |
| PostgreSQL | >= 15 (Supabase) |

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/tducn110/Tracker_yourMoney.git
cd Tracker_yourMoney

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env.local
# Fill in: DATABASE_URL, FIREBASE_*, JWT_SECRET, GEMINI_API_KEY

# 4. Initialize database
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 5. Run app (dev)
pnpm dev

# Production build
pnpm build
```

## Task 1 — Project Planning & Teamwork

### (a) Role Assignment & Contributions

| Member                                  | Role                | Key Contributions (Backed by Git Evidence)                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nguyen Tam Duc** (`tducn110`)         | Team Lead / Backend | Led the team, defined the Budget-First vision, designed the monorepo structure, designed the 14-table PostgreSQL schema, created the ERD in `doc/wiki/erd.md`, designed the Hono API architecture, built the Safe-to-Spend engine, AI Quick Add with Gemini, wallet and analytics integration, shared Zod schemas, seed data, and reviewed/merged PRs `#156` and `#157`.                                                |
| **Tran Vo Ba Vuong** (`ViccVuongVicc`)  | Backend / DevOps    | Fixed AuthProvider race conditions, added production debug tracking, fixed Vercel auth and API deployment with Next.js catch-all routing, added dynamic CORS for `*.vercel.app`, applied rate limiting and cold-start fixes, built `CategoryManager`, `CashWalletWidget`, `useMounted`, refactored UI and auth, migrated logging to Pino, added missing PostgreSQL migrations, and fixed budget/wallet/category issues. |
| **Chau Tuan Kiet** (`kiet00394-collab`) | Frontend / UI-UX    | Built the 4-step onboarding wizard, collaborated on onboarding actions, contributed collaborative commits with Vuong, implemented dashboard and all main pages, social login UI, responsive design, TanStack Query data layer, Sentry integration, AuthGuard, and applied the Container/Presentational pattern.                                                                                                         |

### (b) Wireframe

- **Tool used:** Figma
- **Pages designed:**
  - [x] Dashboard (Budget-First overview)
  - [x] Transactions (list, filter, add/edit/delete)
  - [x] Wallets (multi-wallet management, transfers)
  - [x] Budgets (setup & tracking)
  - [x] Goals (savings targets)
  - [x] Bills (recurring bills)
  - [x] Analytics (spending charts)
  - [x] Settings (categories, profile)
  - [x] Onboarding (4-step wizard)

    ![Figma Wireframe](/screenshots/Screenshot%20from%202026-05-17%2021-42-03.png)

### (c) Project Plan — Milestones

| Milestone                                     | Deadline   | Status  |
| --------------------------------------------- | ---------- | ------- |
| Complete wireframe & Figma design             | 10/04/2026 | On time |
| Setup GitHub, Monorepo & Database Schema      | 15/04/2026 | On time |
| Complete Authentication (Firebase + JWT)      | 18/04/2026 | On time |
| Basic UI (Dashboard, Transactions, Wallets)   | 22/04/2026 | On time |
| Database integration & full CRUD API          | 28/04/2026 | On time |
| AI Quick Add, Analytics, Bills, Goals         | 05/05/2026 | On time |
| Onboarding Wizard, Optimization & Peer Review | 12/05/2026 | On time |
| Submission                                    | 15/05/2026 | On time |

### (d) GitHub Repository

**Repository link:** [github.com/tducn110/Tracker_yourMoney](https://github.com/tducn110/Tracker_yourMoney)

### (e) GitHub Workflow

The team uses Git Flow with `main` branch and feature branches. Each feature is developed on a dedicated branch and merged via Pull Request. Commit messages follow **Conventional Commits**.

**Commit convention:**

| Type        | Description                            |
| ----------- | -------------------------------------- |
| `feat:`     | New feature                            |
| `fix:`      | Bug fix                                |
| `chore:`    | Maintenance work (update deps, config) |
| `docs:`     | Documentation updates                  |
| `refactor:` | Code restructuring                     |

## Task 2 — Implement User Interface

### (a) Pages Built

| Page         | URL / Route     | Description                                                             | Implemented By                                              |
| ------------ | --------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------- |
| Dashboard    | `/`             | Budget-First overview: Safe-to-Spend, ring chart, goals, upcoming bills | Chau Tuan Kiet (UI) + Nguyen Tam Duc (API/S2S Engine)       |
| Transactions | `/transactions` | Transaction list with search, filter, import/export, full CRUD          | Chau Tuan Kiet (UI) + Nguyen Tam Duc (API)                  |
| Wallets      | `/wallets`      | Multi-wallet management with inter-wallet transfers                     | Chau Tuan Kiet (UI) + Nguyen Tam Duc (API)                  |
| Budgets      | `/budgets`      | Set category budgets, track spending percentages                        | Chau Tuan Kiet (UI) + Nguyen Tam Duc (API/S2S Engine)       |
| Goals        | `/goals`        | Savings goals with deadlines and progress tracking                      | Chau Tuan Kiet (UI) + Nguyen Tam Duc (API)                  |
| Bills        | `/bills`        | Manage recurring bills, payment history                                 | Chau Tuan Kiet (UI) + Nguyen Tam Duc (API)                  |
| Analytics    | `/analytics`    | Income/expense charts, category spending breakdown                      | Chau Tuan Kiet (UI) + Nguyen Tam Duc (API/Analytics Engine) |
| Settings     | `/settings`     | Category management, profile, language settings                         | Chau Tuan Kiet                                              |
| Onboarding   | `/onboarding`   | 4-step wizard for new users                                             | Chau Tuan Kiet                                              |

#### Screenshots — Main Pages

![Dashboard](/screenshots/Screenshot%202026-05-17%20at%2014.47.07.png)
_Dashboard_

![Transactions](/screenshots/Screenshot%202026-05-17%20at%2014.49.23.png)
_Transactions_

![Wallets](/screenshots/Screenshot%202026-05-17%20at%2014.49.35.png)
_Wallets_

![Budgets](/screenshots/Screenshot%202026-05-17%20at%2014.49.45.png)
_Budgets_

![Goals](/screenshots/Screenshot%202026-05-17%20at%2014.49.57.png)
_Goals_

![Bills](/screenshots/Screenshot%202026-05-17%20at%2014.50.12.png)
_Bills_

![Analytics](/screenshots/Screenshot%202026-05-17%20at%2014.50.27.png)
_Analytics_

![Settings](/screenshots/Screenshot%20from%202026-05-17%2020-58-31.png)
_Settings_

![Onboarding](/screenshots/Screenshot%20from%202026-05-17%2020-59-39.png)
_Onboarding_

### (b) Tailwind CSS Usage

The entire UI is built with **Tailwind CSS v4** combined with **shadcn/ui** (Radix UI). The responsive system uses breakpoints `sm` (640px), `md` (768px), `lg` (1024px), and `xl` (1280px). Dark mode is supported via the `dark` class.

**Key utility patterns used:**

- Responsive grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- Custom color scheme: primary `#0f3460`, accent `#e94560`, surface `#f8f9fa`
- Dark mode: `dark:bg-gray-900 dark:text-white`
- Transitions & animations: Motion (Framer Motion) with Tailwind
- Container queries for card components

### (c) Interactive Features

| Feature            | Description                                                        | File / Component              | Implemented By                             |
| ------------------ | ------------------------------------------------------------------ | ----------------------------- | ------------------------------------------ |
| Quick Add Modal    | Add transactions via natural language with AI parsing              | `QuickAddModal`, `AIQuickAdd` | Nguyen Tam Duc (API) + Chau Tuan Kiet (UI) |
| Form Validation    | Zod schema validation across frontend and backend                  | Shared schemas package        | Nguyen Tam Duc                             |
| Search & Filter    | Transaction search/filter by category, date, amount                | `TransactionsContainer`       | Chau Tuan Kiet                             |
| Charts             | Ring chart, bar chart, line chart via Recharts                     | Dashboard, Analytics pages    | Chau Tuan Kiet                             |
| Social Login       | Google, Facebook, GitHub, Apple login UI with race condition guard | `AuthProvider`, `LoginPage`   | Chau Tuan Kiet + Tran Vo Ba Vuong          |
| Onboarding Wizard  | Multi-step form for new users                                      | `OnboardingWizard`            | Chau Tuan Kiet                             |
| Loading Skeletons  | Skeleton placeholders while data loads                             | `Skeleton` components         | Chau Tuan Kiet                             |
| Category Manager   | CRUD for user categories                                           | `CategoryManager`             | Tran Vo Ba Vuong                           |
| Cash Wallet Widget | Wallet balance display widget                                      | `CashWalletWidget`            | Tran Vo Ba Vuong                           |
| AuthGuard          | Redirect unauthenticated users to login page                       | `AuthGuard`                   | Chau Tuan Kiet                             |

### (d) Responsive Design

- [x] Mobile (< 768px) — Single column layout, bottom navigation, collapsible sidebar
      ![Mobile View](/screenshots/Screenshot%20from%202026-05-17%2021-31-14.png)
- [x] Tablet (768px – 1024px) — 2-column grid, compact sidebar
      ![Tablet View](/screenshots/Screenshot%20from%202026-05-17%2021-37-43.png)
- [x] Desktop (> 1024px) — Full sidebar, multi-column dashboard, widescreen charts
      ![Desktop View](/screenshots/Screenshot%20from%202026-05-17%2021-42-57.png)

All pages were tested via Chrome DevTools Device Mode and work correctly at every breakpoint.

## Task 3 — Database Integration & Dynamic Content

### (a) Database Design

- **Database system:** Supabase PostgreSQL (TiDB Serverless compatible)
- **ORM:** Drizzle ORM
- **Number of tables:** 14

**Table list:**

| Table            | Description                          | Key Columns                                                            |
| ---------------- | ------------------------------------ | ---------------------------------------------------------------------- |
| users            | User accounts                        | `id`, `firebase_uid`, `email`, `name`, `avatar_url`                    |
| wallets          | Wallets (cash, bank, credit card...) | `id`, `user_id`, `name`, `type`, `balance`, `currency`                 |
| categories       | Income/expense categories            | `id`, `user_id`, `name`, `type`, `icon`, `color`                       |
| transactions     | Income/expense transactions          | `id`, `user_id`, `wallet_id`, `category_id`, `amount`, `type`, `note`  |
| budgets          | Category budgets                     | `id`, `user_id`, `category_id`, `amount`, `period`                     |
| goals            | Savings goals                        | `id`, `user_id`, `name`, `target_amount`, `current_amount`, `deadline` |
| bills            | Recurring bills                      | `id`, `user_id`, `name`, `amount`, `frequency`, `due_date`             |
| notifications    | User notifications                   | `id`, `user_id`, `type`, `message`, `is_read`                          |
| audit_logs       | Activity log                         | `id`, `user_id`, `action`, `entity_type`, `entity_id`                  |
| refresh_tokens   | JWT refresh tokens                   | `id`, `user_id`, `token_hash`, `expires_at`                            |
| user_settings    | User preferences                     | `id`, `user_id`, `language`, `currency`, `theme`                       |
| idempotency_keys | Duplicate transaction prevention     | `key`, `user_id`, `created_at`                                         |
| wallet_transfers | Inter-wallet transfer history        | `id`, `user_id`, `from_wallet`, `to_wallet`, `amount`                  |
| bill_payments    | Bill payment history                 | `id`, `bill_id`, `amount`, `paid_at`                                   |

_Database designed by: Nguyen Tam Duc_

![ER Diagram — Finance Tracker V3](/screenshots/Screenshot%20from%202026-05-18%2012-04-38.png)

### (b) Database Connection

- **Server-side technology:** Hono API (Node.js) embedded in Next.js App Router via catch-all route `/api/[[...route]]`
- **Connection method:** RESTful API with typed client (`@finance/api-client`) using Axios
- **Authentication:** Firebase ID Token → JWT Access Token → session cookie (14-day TTL)

- [x] Create — Add transactions, wallets, budgets, goals, bills
- [x] Read — Lists, details, search, filter
- [x] Update — Edit information, modify records
- [x] Delete — Soft-delete with `deleted_at` timestamp

Connection architecture: **Next.js (App Router) → Hono API → Drizzle ORM → PostgreSQL (Supabase)**. The frontend uses TanStack Query for cache management, optimistic updates, and automatic refetching.

### (c) Dynamic Data Pages

| Page         | Data Displayed                                   | Query / Endpoint                  | Implemented By |
| ------------ | ------------------------------------------------ | --------------------------------- | -------------- |
| Dashboard    | Safe-to-Spend, ring chart, goals, upcoming bills | `GET /api/v1/analytics/dashboard` | Nguyen Tam Duc |
| Transactions | Transaction list, search, filter                 | `GET /api/v1/transactions`        | Nguyen Tam Duc |
| Wallets      | Wallet list, balances                            | `GET /api/v1/wallets`             | Nguyen Tam Duc |
| Budgets      | Budgets, spending percentages                    | `GET /api/v1/budgets`             | Nguyen Tam Duc |
| Goals        | Goals, progress                                  | `GET /api/v1/goals`               | Nguyen Tam Duc |
| Analytics    | Income/expense charts, category breakdown        | `GET /api/v1/analytics`           | Nguyen Tam Duc |

![Dynamic data page 1](/screenshots/Screenshot%20from%202026-05-17%2022-20-28.png)
![Dynamic data page 2](/screenshots/Screenshot%20from%202026-05-17%2022-21-00.png)
![Dynamic data page 3](/screenshots/Screenshot%20from%202026-05-17%2022-21-05.png)
![Dynamic data page 4](/screenshots/Screenshot%20from%202026-05-17%2022-21-08.png)

## Task 4 — Optimization

### (a) Lighthouse Performance Audit

Ran Lighthouse before and after optimization. Score improved from **75 → 92**.

#### Before Optimization

| Metric         | Score |
| -------------- | ----- |
| Performance    | 75    |
| Accessibility  | 85    |
| Best Practices | 90    |
| SEO            | 82    |

![Lighthouse before optimization — Score 75](/screenshots/lighthouse-before.jpeg)

#### After Optimization

| Metric         | Score |
| -------------- | ----- |
| Performance    | 92    |
| Accessibility  | 95    |
| Best Practices | 96    |
| SEO            | 90    |

![Lighthouse after optimization — Score 92](/screenshots/lighthouse-after.jpg)

### (b) Optimizations Applied

| Issue                                          | Fix Applied                                                                        | By               |
| ---------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------- |
| SQL N+1 queries when computing budgets         | Optimized queries using Drizzle joins and subqueries, reduced database round-trips | Nguyen Tam Duc   |
| Floating-point errors in currency calculations | Migrated all arithmetic to Decimal.js, stored and transmitted as strings           | Nguyen Tam Duc   |
| Duplicate transactions from retries            | Applied Idempotency Keys with UNIQUE constraint on PostgreSQL                      | Tran Vo Ba Vuong |
| No system monitoring                           | Integrated Sentry (error tracking) and Pino (structured logging)                   | Tran Vo Ba Vuong |
| API lacks rate limiting                        | Configured rate limiting on Hono API, protected against DDoS                       | Tran Vo Ba Vuong |
| Cache miss after mutations                     | Used TanStack Query `onSuccess` / `onSettled` to invalidate related query keys     | Chau Tuan Kiet   |
| Type errors between frontend and backend       | Shared Zod schemas in `packages/shared-schemas` ensure end-to-end type-safety      | Nguyen Tam Duc   |
| Race condition in auth flow                    | Added race condition guard in AuthProvider for social login — `1cf5543`            | Tran Vo Ba Vuong |
| Console.\* in production                       | Replaced all console.\* with Pino structured logging — `4e629b1`                   | Tran Vo Ba Vuong |
| Cold start performance                         | Removed dead imports and redundant env initialization — `eb079e8`                  | Tran Vo Ba Vuong |

### (c) Error Monitoring & User Analytics

**Sentry:**

- [x] Sentry Node SDK integrated
- Monitored errors: API errors, database connection failures, auth failures, validation errors
- Implemented by: Tran Vo Ba Vuong & Chau Tuan Kiet

**Logging (Pino):**

- [x] Pino structured logging with levels: trace, debug, info, warn, error, fatal
- JSON log format for easy analysis
- Implemented by: Tran Vo Ba Vuong

## Task 5 — UI/UX Peer Review & Evaluation

### (a) Feedback for Other Teams

**Reviewed Team: Calorie Web**

- **Team / Project:** Calorie Web — Calorie Tracking Application
- **Repository:** [github.com/nguyenduythaibao1611-eng/calorie-web.github.io](https://github.com/nguyenduythaibao1611-eng/calorie-web.github.io)

| Aspect         | Strengths                                                                             | Improvement Suggestions                                                                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Functionality  | Complete calorie tracking flow: diary, search, stats, TDEE calculator, water tracking | [PR #78 — Fix streak persistence](https://github.com/nguyenduythaibao1611-eng/calorie-web.github.io/issues/78): streak resets to 0 on page reload; needs to persist streak to profile |
| Data Integrity | Local storage architecture for offline-first experience                               | [PR #79 — Fix timezone bug](https://github.com/nguyenduythaibao1611-eng/calorie-web.github.io/issues/79): `toISOString()` uses UTC, causing a 1-day streak offset for UTC+7 timezone  |
| UI/UX          | Clean dashboard design, responsive layout, animated stats page                        | Could improve with dark mode and accessibility labels for screen readers                                                                                                              |

**Reviewed Team: QuickTodo**

- **Team / Project:** QuickTodo — Task Management Application
- **Repository:** [github.com/hothong3k/QuickTodo](https://github.com/hothong3k/QuickTodo)
- **Feedback by:** Tran Vo Ba Vuong (ViccVuongVicc)
- **Issue:** [#30 — Guest mode: Cannot add subtask — error message lacks clear login guidance](https://github.com/hothong3k/QuickTodo/issues/30)

| Aspect         | Strengths                                                                | Improvement Suggestions                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Usability      | Guest mode allows trying the app without sign-up, lowering entry barrier | When guest tries to add subtask, the error message should include a "Log in" button; alternatively save subtasks to localStorage and offer sync on login |
| Error Handling | App detects unauthorized actions and shows error messages                | Error messages lack actionable guidance — user sees "You must be logged in" but has no path to resolve it                                                |

### (b) Feedback Received (Teacher Review)

| Feedback                                                                                    | Source  | Decision | Reason / Commit                                                                                                                                |
| ------------------------------------------------------------------------------------------- | ------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| AI Quick Add with Gemini is a highlight — should be featured more prominently in the report | Teacher | Accepted | Integrated Gemini NLP adapter into Hono API route `/api/ai/quick-add`, supporting natural language transaction input — `8b3ca4b`               |
| 4-step Onboarding Wizard is great for UX — should be mentioned in self-report               | Teacher | Accepted | Built 4-step onboarding wizard (personal info → wallet → budget → first transaction) with local state persistence and skip support — `fff7e94` |

![Teacher feedback — AI Quick Add](/screenshots/Screenshot%20from%202026-05-17%2021-28-54.png)
![Teacher feedback — Onboarding Wizard](/screenshots/Screenshot%20from%202026-05-17%2021-29-59.png)

## Deliverables Checklist

- [x] **Source code on GitHub** — [github.com/tducn110/Tracker_yourMoney](https://github.com/tducn110/Tracker_yourMoney)
- [x] **README.md** — Setup guide, project overview, feature list with screenshots, ERD
- [x] **ARCHITECTURE.md** — Detailed system architecture documentation
- [x] **Video demo** — [youtube.com/watch?v=zAD1gF02NrU](https://www.youtube.com/watch?v=zAD1gF02NrU)
- [x] **Self-Reports** — Each member committed file to `docs/self-reports/`
- [x] **Vercel Deployment** — [finance-for-me-local.vercel.app](https://finance-for-me-local.vercel.app)

## Appendix — Codebase Evidence

### GitNexus Code Intelligence

| Field            | Value                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------- |
| **Repo indexed** | Tracker_yourMoney                                                                      |
| **Remote**       | [github.com/tducn110/Tracker_yourMoney](https://github.com/tducn110/Tracker_yourMoney) |
| **Stats**        | 308 files, 3660 symbols, 5963 relationships, 115 execution flows                       |

### Top Modules

UI, Services, Repositories, Quick-add, Dashboard, Routes, Budgets, Hooks, Context, Wallet, Middleware

### Main API Route Map

```
/api/auth           /api/v1/wallet        /api/v1/analytics
/api/v1/transactions  /api/v1/bills          /api/v1/categories
/api/v1/goals         /api/v1/budgets        /api/v1/user
/api/v1/notifications /api/v1/ai             /api/v1/health
```

### Important Source Files

| File                                                                              | Role                                          |
| --------------------------------------------------------------------------------- | --------------------------------------------- |
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

### Closed Pull Requests

| PR #      | Title                                                                    | Author           | Status |
| --------- | ------------------------------------------------------------------------ | ---------------- | ------ |
| #185      | chore(web): remove sentry test error button                              | kiet00394-collab | Merged |
| #184      | feat(web): add sentry test trigger button                                | kiet00394-collab | Merged |
| #183      | feat(web): add AuthGuard to redirect unauthenticated users to login page | kiet00394-collab | Merged |
| #157      | fix/update-lockfile                                                      | tducn110         | Merged |
| #156      | fix/issue-155-type-errors                                                | tducn110         | Merged |
| #154      | feat(web): enhance wallet integration and analytics                      | Nguyen Tam Duc   | Merged |
| #152      | feat(api,web): refactor dashboard and S2S engine                         | Nguyen Tam Duc   | Merged |
| #150      | feat(api,web): implement AI Quick Add with Gemini                        | Nguyen Tam Duc   | Merged |
| #144      | fix(vercel): fix auth and api deployment as Next.js route                | Tran Vo Ba Vuong | Merged |
| #139      | feat(web): implement useMounted hook for client-side rendering           | Tran Vo Ba Vuong | Merged |
| #129-#136 | feat(system): comprehensive UI refactor and auth optimization            | Tran Vo Ba Vuong | Merged |
| #116      | fix/102                                                                  | Nguyen Tam Duc   | Merged |
| #102      | fix(web): parse JSON error responses and display detailed errors         | Tran Vo Ba Vuong | Merged |
| #101      | fix(web): race condition guard in AuthProvider social login              | Tran Vo Ba Vuong | Merged |
| #100      | fix(api): add success:false to 429 rate limit error response             | Tran Vo Ba Vuong | Merged |
| #99       | fix(api): raise auth route rate limit from 10 to 30 req/min              | Tran Vo Ba Vuong | Merged |
| #98       | fix(api): step tracking to /api/auth/social for debug                    | Tran Vo Ba Vuong | Merged |
| #97       | fix(api): remove dead imports for cold start optimization                | Tran Vo Ba Vuong | Merged |
| #96       | fix(api): dynamic CORS origin support for \*.vercel.app                  | Tran Vo Ba Vuong | Merged |
| #87       | feat(ui): tailwind v4 migration and frontend fixes                       | kiet00394-collab | Merged |
| #89       | fix: wire QuickAddModal and SimpleQuickInput to real API calls           | kiet00394-collab | Merged |
| #78       | feat(web): complete phase 3 dashboard localization refactor              | kiet00394-collab | Merged |
| #33       | Release: dev to main (Phase 1 + Phase 2)                                 | Tran Vo Ba Vuong | Merged |
| #17       | chore(db): remove unused budget_wallets table                            | Nguyen Tam Duc   | Merged |
| #15       | chore: cleanup legacy UI components and JS schemas                       | Nguyen Tam Duc   | Merged |
| #10       | feature/issue-5-aesthetics                                               | Nguyen Tam Duc   | Merged |
| #9        | feature/issue-4-quick-add                                                | Nguyen Tam Duc   | Merged |
| #8        | feature/issue-3-multi-wallet                                             | Nguyen Tam Duc   | Merged |
| #7        | implement budget-first UI and API services                               | Nguyen Tam Duc   | Merged |
| #6        | feature/issue-2-budget-core                                              | Nguyen Tam Duc   | Merged |
| #5        | feat(ui): implement global UI design reframing v3 aesthetics             | Nguyen Tam Duc   | Merged |
| #4        | feat(quick-add): enhanced quick-add components with NLP and Simple modes | Nguyen Tam Duc   | Merged |
| #3        | feat(wallet): implement multi-wallet management and sync UI              | Nguyen Tam Duc   | Merged |
| #2        | feat(budget): implement core budget-first infrastructure                 | Nguyen Tam Duc   | Merged |

### Full Commit History (Last 80+ Commits with Authors)

```
─── May 19, 2026 (Post-Submission) ───
0bf3ebb chore(web): remove sentry test error button (#185)                      (Chau Tuan Kiet)
5de4950 feat(web): add sentry test trigger button (#184)                        (Chau Tuan Kiet)
a1aff22 feat(web): add AuthGuard to redirect unauthenticated users to login page (#183) (Chau Tuan Kiet)
78c2c2a feat(api,web): use monthlyExpense for QuickStats and fix analyticsAPI syntax (Chau Tuan Kiet)
6242da1 chore: sync remaining changes for analytics, notifications, and loading features (Chau Tuan Kiet)
1f296c0 feat(analytics): add daily summary + filters; create transaction notifications (Chau Tuan Kiet)

─── May 18, 2026 ───
064ac44 docs: link self reports to repo files                                (Tran Vo Ba Vuong)

─── May 2026 (Pre-Submission) ───
fff7e94 feat: onboarding wizard 4 buoc - info, wallet, budget, transaction   (Chau Tuan Kiet)
a152b3b feat: integrate local onboarding wizard actions and deepseek mcp skills (Tran Vo Ba Vuong)
46ada24 Merge pull request #157 from tducn110/fix/update-lockfile            (Nguyen Tam Duc)
55beb49 chore: update pnpm-lock.yaml                                         (Tran Vo Ba Vuong)
5448dc9 Merge pull request #156 from tducn110/fix/issue-155-type-errors      (Nguyen Tam Duc)
d17a5ae fix(web): resolve type errors and normalize currency formatting       (Tran Vo Ba Vuong)
1439c58 feat(web): enhance wallet integration and analytics (#154)           (Nguyen Tam Duc)
f650aed feat(api,web): refactor dashboard and S2S engine (#152)              (Nguyen Tam Duc)
8b3ca4b feat(api,web): implement AI Quick Add with Gemini integration (#150) (Nguyen Tam Duc)
7090921 fix: seed default categories for all users on login                   (Tran Vo Ba Vuong)
c92cfb9 fix: budget form shows only expense categories + auto-seed defaults   (Tran Vo Ba Vuong)
77b9634 fix: sync lockfile, refactor API routing for Vercel compatibility     (Tran Vo Ba Vuong)
fa1a282 fix(vercel): fix auth and api deployment as Next.js route (#144)      (Tran Vo Ba Vuong)
08d5053 feat(web): implement useMounted hook for client-side rendering (#139) (Tran Vo Ba Vuong)
1013b1f feat(web): implement CategoryManager component                        (Tran Vo Ba Vuong)
4898849 feat(web): implement CashWalletWidget component                       (Tran Vo Ba Vuong)
613a823 feat(system): comprehensive UI refactor and auth optimization (#129-#136) (Tran Vo Ba Vuong)
a1847d3 Merge PR #116 from tducn110 (fix/102)                                (Tran Vo Ba Vuong)
75928c3 fix(vercel): remove broken ignoreCommand                              (Tran Vo Ba Vuong)
804e27f fix(web): parse JSON error responses and display detailed errors (#102) (Tran Vo Ba Vuong)
1cf5543 fix(web): race condition guard in AuthProvider social login (#101)    (Tran Vo Ba Vuong)
64cbe5d fix(api): add success:false to 429 rate limit error response (#100)   (Tran Vo Ba Vuong)
a0e01a8 fix(api): raise auth route rate limit from 10 to 30 req/min (#99)     (Tran Vo Ba Vuong)
99d7143 fix(api): step tracking to /api/auth/social for debug (#98)           (Tran Vo Ba Vuong)
eb079e8 fix(api): remove dead imports for cold start optimization (#97)        (Tran Vo Ba Vuong)
1b9f7be fix(api): dynamic CORS origin support for *.vercel.app (#96)          (Tran Vo Ba Vuong)
48aed12 fix(web): parse JSON error responses and display detailed errors (#102) (Tran Vo Ba Vuong)
bfa1c11 docs: update implementation plan and backlog tasks                    (Tran Vo Ba Vuong)
c66de08 fix(db): add missing migrations for PostgreSQL and bigint IDs         (Tran Vo Ba Vuong)
4e629b1 refactor(api,db): eliminate magic strings, migrate console.* to pino  (Tran Vo Ba Vuong)
c110ddb fix: Vercel API routing, deployment prep, and debug endpoints         (Tran Vo Ba Vuong)

─── Collaborative (Chau Tuan Kiet & Tran Vo Ba Vuong) ───
97b4f4d fix(api,worker,web,db): financial logic integrity — wallet OCC, PostgreSQL compat
ecd5fb0 fix(worker,web,api): worker DB env, Firebase SSR crash, API/DB/UI updates
fa7319a feat(ui): tailwind v4 migration and frontend fixes (#87)
f393e47 fix: client toSnake interceptor broke all API writes — remove for camelCase API
49cfa80 fix: wire QuickAddModal and SimpleQuickInput to real API calls (#89)
59af0c5 feat: backend scale & performance phase 11-15, ui tailwind v4 fixes
da139ec feat(automation): add recurring bills worker, notifications and settings UI
7d6a643 chore: resolve typechecking and UI warnings
b4e8551 feat(web): enhance login UI with premium background (Phase 9) & fix worker tsconfig
2a9423d feat: frontend refactor, react-query, optimistic updates (Phases 6-8)
6c6cdd7 feat(web): complete phase 3 dashboard localization refactor (#78)

─── Nguyen Tam Duc — Phase 3-5 (AI-assisted) ───
a5c79b9 feat: complete feature gaps — transfer, categories, empty states (Phase 5) (Nguyen Tam Duc)
e510915 feat: wire frontend to real APIs (Phase 4)                                  (Nguyen Tam Duc)
c193b16 fix(db): add walletId to transaction schemas and fix type errors (Phase 3)  (Nguyen Tam Duc)
cdd727c docs: add Phase 2 completion report                                         (Nguyen Tam Duc)
af1542e feat(db): sync database schema to ERD (migration 0012)                      (Nguyen Tam Duc)

─── Mid-Phase Cleanup & Refactor ───
034fab6 Release: dev to main (Phase 1 + Phase 2) (#33)                              (Tran Vo Ba Vuong)
9637add chore(db): remove unused budget_wallets table (#17)                         (Nguyen Tam Duc)
4d4aa58 chore: cleanup legacy UI components and JS schemas (#15)                    (Nguyen Tam Duc)
32a91f4 feat(ui): refactor dashboard pages to container-presentational pattern       (Nguyen Tam Duc)
9fd9950 chore: add clean mcp_config.json                                            (Nguyen Tam Duc)
60e3945 docs: reorganize documentation and add repomix-output.xml                   (Nguyen Tam Duc)
3904c75 fix(api): correct project_id casing in firebase auth init                   (Nguyen Tam Duc)
d1974e2 chore: clean up remaining AI tool directories                               (Nguyen Tam Duc)
4340af4 feat(doc): finalize documentation reorganization and gitignore update       (Nguyen Tam Duc)

─── Nguyen Tam Duc — Early Phase (Foundation) ───
c5bc5ef Merge PR #7: implement budget-first UI and API services                     (Nguyen Tam Duc)
df74302 Merge PR #10: feature/issue-5-aesthetics                                    (Nguyen Tam Duc)
15b0798 Merge PR #9: feature/issue-4-quick-add                                      (Nguyen Tam Duc)
28f459f Merge PR #8: feature/issue-3-multi-wallet                                   (Nguyen Tam Duc)
91b63c4 Merge PR #6: feature/issue-2-budget-core                                    (Nguyen Tam Duc)
3749f98 feat(ui): implement global UI design reframing v3 aesthetics (#5)           (Nguyen Tam Duc)
3b1395d feat(quick-add): enhanced quick-add components with NLP and Simple modes (#4) (Nguyen Tam Duc)
180fd8a feat(wallet): implement multi-wallet management and sync UI (#3)            (Nguyen Tam Duc)
10dd3c3 feat(budget): implement core budget-first infrastructure (#2)               (Nguyen Tam Duc)
5ee3de2 feat(auth): complete migration to Firebase Social Login and Session Cookies (Nguyen Tam Duc)
2dd223e chore: initial framework structure                                          (Nguyen Tam Duc)
```

## Self-Reports

| Full Name        | Student ID | Self-Report Link                                                         |
| ---------------- | ---------- | ------------------------------------------------------------------------ |
| Nguyen Tam Duc   | 24020005   | [/self-reports/nguyen-tam-duc](/self-reports/self-report-24020005.md/)   |
| Tran Vo Ba Vuong | 24020008   | [/self-reports/tran-vo-ba-vuong](/self-reports/self-report-24020008.md/) |
| Chau Tuan Kiet   | 24020010   | [/self-reports/chau-tuan-kiet](/self-reports/self-report-24020010.md/)   |

---

**Final Project Report — Finance Tracker V3 | Team Antigravity | Submission Date: 15/05/2026**
