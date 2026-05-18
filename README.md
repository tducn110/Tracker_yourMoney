---
title: Group Report
description: Final project report for Finance Tracker V3.
---

# Finance Tracker V3 — Final Project Report

## Team Information

| Field | Value |
| --- | --- |
| **Team Name** | Antigravity |
| **Project Name** | Finance Tracker V3 — Personal Finance Management App |
| **GitHub Repository** | [github.com/tducn110/Tracker_yourMoney](https://github.com/tducn110/Tracker_yourMoney) |
| **Demo Deploy** | [finance-for-me-local.vercel.app](https://finance-for-me-local.vercel.app) |
| **Video Demo** | [youtube.com/watch?v=zAD1gF02NrU](https://www.youtube.com/watch?v=zAD1gF02NrU) |
| **Submission Date** | 15/05/2026 |

### Team Members

| Full Name | Student ID | Role |
| --- | --- | --- |
| Nguyen Tam Duc | 24020005 | Team Lead / Backend / Database / Architecture |
| Tran Vo Ba Vuong | 24020008 | Backend / Auth / Middleware / DevOps / Worker |
| Chau Tuan Kiet | 24020010 | Frontend / UI-UX / Dashboard / Components |


## Individual Self-Report

The individual self-report files are included as separate pages and linked here for direct access from the group report.

| Team Member | Student ID | Self-Report |
| --- | --- | --- |
| Nguyen Tam Duc | 24020005 | [Nguyen Tam Duc self-report](doc/self-report/self-report-24020005.md) |
| Tran Vo Ba Vuong | 24020008 | [Tran Vo Ba Vuong self-report](doc/self-report/self-report-24020008.md) |
| Chau Tuan Kiet | 24020010 | [Chau Tuan Kiet self-report](doc/self-report/self-report-24020010.md) |

## Project Overview & Technologies Used

### Application Description

Finance Tracker V3 is a personal finance management application following the **Budget-First** philosophy, putting budgets at the center. The app helps users track income and expenses, manage multiple wallets, set category-based budgets, monitor recurring bills, set savings goals, and analyze spending habits through charts. It is targeted at individuals who want to manage their finances scientifically and accurately.

### Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Radix UI, shadcn/ui, TanStack Query, Recharts, Motion |
| Backend | Hono API (Node.js), TypeScript, Zod, Firebase Auth/Admin, JWT, Pino logging |
| Database | Supabase PostgreSQL, Drizzle ORM (14 tables) |
| Auth | Firebase Authentication (Google, Facebook, GitHub, Apple) |
| Monorepo | Turborepo + pnpm Workspace (`apps/api`, `apps/web`, `apps/worker`, `packages/db`, `packages/api-client`, `packages/shared-schemas`, `packages/cache`) |
| Deploy | Vercel |

### Key Features

- **Multi-Wallet:** Support for multiple wallets (cash, bank, credit card, e-wallet, investment) with inter-wallet transfers.
- **AI Quick Add:** Add transactions quickly using natural language such as `Breakfast 35k`, auto-detecting category and amount via Gemini AI.
- **Budget Management:** Set category budgets, track spending percentages, and receive overspend alerts.
- **Recurring Bills:** Track monthly, quarterly, and yearly bills, payment history, and reminders.
- **Savings Goals:** Set goals with deadlines, track progress, and fund directly from wallets.

<div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:'0.5rem', marginTop:'1rem'}}>
  <img src="doc/screenshots/Screenshot from 2026-05-17 21-28-54.png" alt="Feature screenshot" style={{width:'100%', borderRadius:'8px', aspectRatio:'16/10', objectFit:'cover'}} />
  <img src="doc/screenshots/Screenshot from 2026-05-17 21-11-49.png" alt="Feature screenshot" style={{width:'100%', borderRadius:'8px', aspectRatio:'16/10', objectFit:'cover'}} />
  <img src="doc/screenshots/Screenshot from 2026-05-17 21-12-38.png" alt="Feature screenshot" style={{width:'100%', borderRadius:'8px', aspectRatio:'16/10', objectFit:'cover'}} />
  <img src="doc/screenshots/Screenshot from 2026-05-17 21-13-37.png" alt="Feature screenshot" style={{width:'100%', borderRadius:'8px', aspectRatio:'16/10', objectFit:'cover'}} />
  <img src="doc/screenshots/Screenshot from 2026-05-17 21-14-38.png" alt="Feature screenshot" style={{width:'100%', borderRadius:'8px', aspectRatio:'16/10', objectFit:'cover'}} />
</div>

## Setup & Installation Guide

### System Requirements

| Tool | Version |
| --- | --- |
| Node.js | >= 20.x |
| pnpm | >= 9.x |
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

The team divided work by application layer, each member owning a core domain. All contributions are backed by Git evidence.

| Member | Role | Key Contributions (Backed by Git Evidence) |
| --- | --- | --- |
| **Nguyen Tam Duc** (`tdu._cn`) | `Team Lead` `Backend` | Led the team, defined the Budget-First vision, designed the monorepo structure, designed the 14-table PostgreSQL schema, created the ERD in `doc/wiki/erd.md`, designed the Hono API architecture, built the Safe-to-Spend engine, AI Quick Add with Gemini, wallet and analytics integration, shared Zod schemas, seed data, and reviewed/merged PRs `#156` and `#157`. |
| **Tran Vo Ba Vuong** (`ViccVuongVicc`) | `Backend` `DevOps` | Fixed AuthProvider race conditions, added production debug tracking, fixed Vercel auth and API deployment with Next.js catch-all routing, added dynamic CORS for `*.vercel.app`, applied rate limiting and cold-start fixes, built `CategoryManager`, `CashWalletWidget`, `useMounted`, refactored UI and auth, migrated logging to Pino, added missing PostgreSQL migrations, and fixed budget/wallet/category issues. |
| **Chau Tuan Kiet** | `Frontend` `UI/UX` | Built the 4-step onboarding wizard, collaborated on onboarding actions, contributed 11 collaborative commits with Vuong, implemented dashboard and all main pages, social login UI, responsive design, TanStack Query data layer, and applied the Container/Presentational pattern. |

### (b) Wireframe

- **Tool used:** Figma
- **Pages designed:**

<ul className="checklist">
  <li className="done">Dashboard (Budget-First overview)</li>
  <li className="done">Transactions (list, filter, add/edit/delete)</li>
  <li className="done">Wallets (multi-wallet management, transfers)</li>
  <li className="done">Budgets (setup & tracking)</li>
  <li className="done">Goals (savings targets)</li>
  <li className="done">Bills (recurring bills)</li>
  <li className="done">Analytics (spending charts)</li>
  <li className="done">Settings (categories, profile)</li>
  <li className="done">Onboarding (4-step wizard)</li>
</ul>

### (c) Project Plan — Milestones

| Milestone | Deadline | Status |
| --- | --- | --- |
| Complete wireframe & Figma design | 10/04/2026 | <span className="badge badge-green">On time</span> |
| Setup GitHub, Monorepo & Database Schema | 15/04/2026 | <span className="badge badge-green">On time</span> |
| Complete Authentication (Firebase + JWT) | 18/04/2026 | <span className="badge badge-green">On time</span> |
| Basic UI (Dashboard, Transactions, Wallets) | 22/04/2026 | <span className="badge badge-green">On time</span> |
| Database integration & full CRUD API | 28/04/2026 | <span className="badge badge-green">On time</span> |
| AI Quick Add, Analytics, Bills, Goals | 05/05/2026 | <span className="badge badge-green">On time</span> |
| Onboarding Wizard, Optimization & Peer Review | 12/05/2026 | <span className="badge badge-green">On time</span> |
| Submission | 15/05/2026 | <span className="badge badge-green">On time</span> |

### (d) GitHub Repository

**Repository link:** [github.com/tducn110/Tracker_yourMoney](https://github.com/tducn110/Tracker_yourMoney)

### (e) GitHub Workflow

The team uses Git Flow with `main` branch and feature branches. Each feature is developed on a dedicated branch and merged via Pull Request. Commit messages follow **Conventional Commits**.

**Commit convention:**

```text
feat:     New feature
fix:      Bug fix
chore:    Maintenance work (update deps, config)
docs:     Documentation updates
refactor: Code restructuring
```

**Representative commit messages:**

```text
fff7e94 feat: onboarding wizard 4 buoc - info, wallet, budget, transaction  (Chau Tuan Kiet)
1439c58 feat(web): enhance wallet integration and analytics (#154)         (Nguyen Tam Duc)
f650aed feat(api,web): refactor dashboard and S2S engine (#152)            (Nguyen Tam Duc)
8b3ca4b feat(api,web): implement AI Quick Add with Gemini (#150)           (Nguyen Tam Duc)
613a823 feat(system): comprehensive UI refactor and auth (#129-#136)       (Tran Vo Ba Vuong)
fa1a282 fix(vercel): fix auth and api deployment as Next.js route (#144)   (Tran Vo Ba Vuong)
4e629b1 refactor(api,db): eliminate magic strings, migrate to pino         (Tran Vo Ba Vuong)
d17a5ae fix(web): resolve type errors and normalize currency formatting     (Tran Vo Ba Vuong)
1cf5543 fix(web): race condition guard in AuthProvider (#101)              (Tran Vo Ba Vuong)

Collaborative (kiet00394-collab: Chau Tuan Kiet & Tran Vo Ba Vuong)
2a9423d feat: frontend refactor, react-query, optimistic updates (Phases 6-8)
b4e8551 feat(web): enhance login UI with premium background (Phase 9)
59af0c5 feat: backend scale & performance phase 11-15, ui tailwind v4 fixes
fa7319a feat(ui): tailwind v4 migration and frontend fixes (#87)
97b4f4d fix: financial logic integrity — wallet OCC, PostgreSQL compat
da139ec feat(automation): add recurring bills worker, notifications & settings UI
```

## Task 2 — Implement User Interface

### (a) Pages Built

| Page | URL / Route | Description | Implemented By |
| --- | --- | --- | --- |
| Dashboard | `/` | Budget-First overview: Safe-to-Spend, ring chart, goals, upcoming bills | Chau Tuan Kiet (UI) + Nguyen Tam Duc (API/S2S Engine) |
| Transactions | `/transactions` | Transaction list with search, filter, import/export, full CRUD | Chau Tuan Kiet (UI) + Nguyen Tam Duc (API) |
| Wallets | `/wallets` | Multi-wallet management with inter-wallet transfers | Chau Tuan Kiet (UI) + Nguyen Tam Duc (API) |
| Budgets | `/budgets` | Set category budgets, track spending percentages | Chau Tuan Kiet (UI) + Nguyen Tam Duc (API/S2S Engine) |
| Goals | `/goals` | Savings goals with deadlines and progress tracking | Chau Tuan Kiet (UI) + Nguyen Tam Duc (API) |
| Bills | `/bills` | Manage recurring bills, payment history | Chau Tuan Kiet (UI) + Nguyen Tam Duc (API) |
| Analytics | `/analytics` | Income/expense charts, category spending breakdown | Chau Tuan Kiet (UI) + Nguyen Tam Duc (API/Analytics Engine) |
| Settings | `/settings` | Category management, profile, language settings | Chau Tuan Kiet |
| Onboarding | `/onboarding` | 4-step wizard for new users | Chau Tuan Kiet |

#### Screenshots — Main Pages

<div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'1rem', marginTop:'1rem'}}>
  <div><img src="doc/screenshots/Screenshot 2026-05-17 at 14.47.07.png" alt="Dashboard" style={{width:'100%', borderRadius:'8px'}} /><p style={{textAlign:'center', fontSize:'0.85rem'}}>Dashboard</p></div>
  <div><img src="doc/screenshots/Screenshot 2026-05-17 at 14.49.23.png" alt="Transactions" style={{width:'100%', borderRadius:'8px'}} /><p style={{textAlign:'center', fontSize:'0.85rem'}}>Transactions</p></div>
  <div><img src="doc/screenshots/Screenshot 2026-05-17 at 14.49.35.png" alt="Wallets" style={{width:'100%', borderRadius:'8px'}} /><p style={{textAlign:'center', fontSize:'0.85rem'}}>Wallets</p></div>
  <div><img src="doc/screenshots/Screenshot 2026-05-17 at 14.49.45.png" alt="Budgets" style={{width:'100%', borderRadius:'8px'}} /><p style={{textAlign:'center', fontSize:'0.85rem'}}>Budgets</p></div>
  <div><img src="doc/screenshots/Screenshot 2026-05-17 at 14.49.57.png" alt="Goals" style={{width:'100%', borderRadius:'8px'}} /><p style={{textAlign:'center', fontSize:'0.85rem'}}>Goals</p></div>
  <div><img src="doc/screenshots/Screenshot 2026-05-17 at 14.50.12.png" alt="Bills" style={{width:'100%', borderRadius:'8px'}} /><p style={{textAlign:'center', fontSize:'0.85rem'}}>Bills</p></div>
  <div><img src="doc/screenshots/Screenshot 2026-05-17 at 14.50.27.png" alt="Analytics" style={{width:'100%', borderRadius:'8px'}} /><p style={{textAlign:'center', fontSize:'0.85rem'}}>Analytics</p></div>
  <div><img src="doc/screenshots/Screenshot from 2026-05-17 20-58-31.png" alt="Settings" style={{width:'100%', borderRadius:'8px'}} /><p style={{textAlign:'center', fontSize:'0.85rem'}}>Settings</p></div>
  <div><img src="doc/screenshots/Screenshot from 2026-05-17 20-59-39.png" alt="Onboarding" style={{width:'100%', borderRadius:'8px'}} /><p style={{textAlign:'center', fontSize:'0.85rem'}}>Onboarding</p></div>
</div>

### (b) Tailwind CSS Usage

The entire UI is built with **Tailwind CSS v4** combined with **shadcn/ui** (Radix UI). The responsive system uses breakpoints `sm` (640px), `md` (768px), `lg` (1024px), and `xl` (1280px). Dark mode is supported via the `dark` class.

**Key utility patterns used:**

- Responsive grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- Custom color scheme: primary `#0f3460`, accent `#e94560`, surface `#f8f9fa`
- Dark mode: `dark:bg-gray-900 dark:text-white`
- Transitions & animations: Motion (Framer Motion) with Tailwind
- Container queries for card components

### (c) Interactive Features

| Feature | Description | File / Component | Implemented By |
| --- | --- | --- | --- |
| Quick Add Modal | Add transactions via natural language with AI parsing | `QuickAddModal`, `AIQuickAdd` | Nguyen Tam Duc (API) + Chau Tuan Kiet (UI) |
| Form Validation | Zod schema validation across frontend and backend | Shared schemas package | Nguyen Tam Duc |
| Search & Filter | Transaction search/filter by category, date, amount | `TransactionsContainer` | Chau Tuan Kiet |
| Charts | Ring chart, bar chart, line chart via Recharts | Dashboard, Analytics pages | Chau Tuan Kiet |
| Social Login | Google, Facebook, GitHub, Apple login UI with race condition guard | `AuthProvider`, `LoginPage` | Chau Tuan Kiet + Tran Vo Ba Vuong |
| Onboarding Wizard | Multi-step form for new users | `OnboardingWizard` | Chau Tuan Kiet |
| Loading Skeletons | Skeleton placeholders while data loads | `Skeleton` components | Chau Tuan Kiet |
| Category Manager | CRUD for user categories | `CategoryManager` | Tran Vo Ba Vuong |
| Cash Wallet Widget | Wallet balance display widget | `CashWalletWidget` | Tran Vo Ba Vuong |

### (d) Responsive Design

<ul className="checklist">
  <li className="done">Mobile (&lt; 768px) — Single column layout, bottom navigation, collapsible sidebar</li>
  <li className="done">Tablet (768px – 1024px) — 2-column grid, compact sidebar</li>
  <li className="done">Desktop (&gt; 1024px) — Full sidebar, multi-column dashboard, widescreen charts</li>
</ul>

All pages were tested via Chrome DevTools Device Mode and work correctly at every breakpoint.

## Task 3 — Database Integration & Dynamic Content

### (a) Database Design

- **Database system:** Supabase PostgreSQL (TiDB Serverless compatible)
- **ORM:** Drizzle ORM
- **Number of tables:** 14

**Table list:**

| Table | Description | Key Columns |
| --- | --- | --- |
| users | User accounts | `id`, `firebase_uid`, `email`, `name`, `avatar_url` |
| wallets | Wallets (cash, bank, credit card...) | `id`, `user_id`, `name`, `type`, `balance`, `currency` |
| categories | Income/expense categories | `id`, `user_id`, `name`, `type`, `icon`, `color` |
| transactions | Income/expense transactions | `id`, `user_id`, `wallet_id`, `category_id`, `amount`, `type`, `note` |
| budgets | Category budgets | `id`, `user_id`, `category_id`, `amount`, `period` |
| goals | Savings goals | `id`, `user_id`, `name`, `target_amount`, `current_amount`, `deadline` |
| bills | Recurring bills | `id`, `user_id`, `name`, `amount`, `frequency`, `due_date` |
| notifications | User notifications | `id`, `user_id`, `type`, `message`, `is_read` |
| audit_logs | Activity log | `id`, `user_id`, `action`, `entity_type`, `entity_id` |
| refresh_tokens | JWT refresh tokens | `id`, `user_id`, `token_hash`, `expires_at` |
| user_settings | User preferences | `id`, `user_id`, `language`, `currency`, `theme` |
| idempotency_keys | Duplicate transaction prevention | `key`, `user_id`, `created_at` |
| wallet_transfers | Inter-wallet transfer history | `id`, `user_id`, `from_wallet`, `to_wallet`, `amount` |
| bill_payments | Bill payment history | `id`, `bill_id`, `amount`, `paid_at` |

*Database designed by: Nguyen Tam Duc*

<img src="doc/screenshots/Screenshot from 2026-05-18 12-04-38.png" alt="ER Diagram — Finance Tracker V3" style={{maxWidth:'100%', borderRadius:'8px', marginTop:'1rem'}} />

### (b) Database Connection

- **Server-side technology:** Hono API (Node.js) embedded in Next.js App Router via catch-all route `/api/[[...route]]`
- **Connection method:** RESTful API with typed client (`@finance/api-client`) using Axios
- **Authentication:** Firebase ID Token → JWT Access Token → session cookie (14-day TTL)

<ul className="checklist">
  <li className="done">Create — Add transactions, wallets, budgets, goals, bills</li>
  <li className="done">Read — Lists, details, search, filter</li>
  <li className="done">Update — Edit information, modify records</li>
  <li className="done">Delete — Soft-delete with `deleted_at` timestamp</li>
</ul>

Connection architecture: **Next.js (App Router) → Hono API → Drizzle ORM → PostgreSQL (Supabase)**. The frontend uses TanStack Query for cache management, optimistic updates, and automatic refetching.

### (c) Dynamic Data Pages

| Page | Data Displayed | Query / Endpoint | Implemented By |
| --- | --- | --- | --- |
| Dashboard | Safe-to-Spend, ring chart, goals, upcoming bills | `GET /api/v1/analytics/dashboard` | Nguyen Tam Duc |
| Transactions | Transaction list, search, filter | `GET /api/v1/transactions` | Nguyen Tam Duc |
| Wallets | Wallet list, balances | `GET /api/v1/wallets` | Nguyen Tam Duc |
| Budgets | Budgets, spending percentages | `GET /api/v1/budgets` | Nguyen Tam Duc |
| Goals | Goals, progress | `GET /api/v1/goals` | Nguyen Tam Duc |
| Analytics | Income/expense charts, category breakdown | `GET /api/v1/analytics` | Nguyen Tam Duc |

<div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginTop:'1rem'}}>
  <img src="doc/screenshots/Screenshot from 2026-05-17 22-20-28.png" alt="Dynamic data page" style={{width:'100%', borderRadius:'8px'}} />
  <img src="doc/screenshots/Screenshot from 2026-05-17 22-21-00.png" alt="Dynamic data page" style={{width:'100%', borderRadius:'8px'}} />
  <img src="doc/screenshots/Screenshot from 2026-05-17 22-21-05.png" alt="Dynamic data page" style={{width:'100%', borderRadius:'8px'}} />
  <img src="doc/screenshots/Screenshot from 2026-05-17 22-21-08.png" alt="Dynamic data page" style={{width:'100%', borderRadius:'8px'}} />
</div>

## Task 4 — Optimization

### (a) Lighthouse Performance Audit

Ran Lighthouse before and after optimization. Score improved from **75 → 92**.

#### Before Optimization

| Metric | Score |
| --- | --- |
| Performance | 75 |
| Accessibility | 85 |
| Best Practices | 90 |
| SEO | 82 |

<img src="doc/screenshots/lighthouse-before.jpeg" alt="Lighthouse before optimization — Score 75" style={{maxWidth:'100%', margin:'1rem 0'}} />

#### After Optimization

| Metric | Score |
| --- | --- |
| Performance | 92 |
| Accessibility | 95 |
| Best Practices | 96 |
| SEO | 90 |

<img src="doc/screenshots/lighthouse-after.jpg" alt="Lighthouse after optimization — Score 92" style={{maxWidth:'100%', margin:'1rem 0'}} />

### (b) Optimizations Applied

| Issue | Fix Applied | By |
| --- | --- | --- |
| SQL N+1 queries when computing budgets | Optimized queries using Drizzle joins and subqueries, reduced database round-trips | Nguyen Tam Duc |
| Floating-point errors in currency calculations | Migrated all arithmetic to Decimal.js, stored and transmitted as strings | Nguyen Tam Duc |
| Duplicate transactions from retries | Applied Idempotency Keys with UNIQUE constraint on PostgreSQL | Tran Vo Ba Vuong |
| No system monitoring | Integrated Sentry (error tracking) and Pino (structured logging) | Tran Vo Ba Vuong |
| API lacks rate limiting | Configured rate limiting on Hono API, protected against DDoS | Tran Vo Ba Vuong |
| Cache miss after mutations | Used TanStack Query `onSuccess` / `onSettled` to invalidate related query keys | Chau Tuan Kiet |
| Type errors between frontend and backend | Shared Zod schemas in `packages/shared-schemas` ensure end-to-end type-safety | Nguyen Tam Duc |
| Race condition in auth flow | Added race condition guard in AuthProvider for social login — `1cf5543` | Tran Vo Ba Vuong |
| Console.* in production | Replaced all console.* with Pino structured logging — `4e629b1` | Tran Vo Ba Vuong |
| Cold start performance | Removed dead imports and redundant env initialization — `eb079e8` | Tran Vo Ba Vuong |

### (c) Error Monitoring & User Analytics

**Sentry:**

<ul className="checklist">
  <li className="done">Sentry Node SDK integrated</li>
  <li>Monitored errors: API errors, database connection failures, auth failures, validation errors</li>
  <li>Implemented by: Tran Vo Ba Vuong</li>
</ul>

**Logging (Pino):**

<ul className="checklist">
  <li className="done">Pino structured logging with levels: trace, debug, info, warn, error, fatal</li>
  <li>JSON log format for easy analysis</li>
  <li>Implemented by: Tran Vo Ba Vuong</li>
</ul>

## Task 5 — UI/UX Peer Review & Evaluation

### (a) Feedback for Other Teams

<div className="section-card">
  <h4>Reviewed Team: Calorie Web</h4>
  <ul>
    <li><strong>Team / Project:</strong> Calorie Web — Calorie Tracking Application</li>
    <li><strong>Repository:</strong> <a href="https://github.com/nguyenduythaibao1611-eng/calorie-web.github.io" target="_blank" rel="noopener">github.com/nguyenduythaibao1611-eng/calorie-web.github.io</a></li>
    <li><strong>Feedback Issues:</strong> <a href="https://github.com/nguyenduythaibao1611-eng/calorie-web.github.io/issues" target="_blank" rel="noopener">GitHub Issues</a></li>
  </ul>
  <table>
    <thead>
      <tr><th>Aspect</th><th>Strengths</th><th>Improvement Suggestions</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>Functionality</td>
        <td>Complete calorie tracking flow: diary, search, stats, TDEE calculator, water tracking</td>
        <td><a href="https://github.com/nguyenduythaibao1611-eng/calorie-web.github.io/issues/78" target="_blank" rel="noopener">PR #1 — Fix streak persistence:</a> streak resets to 0 on page reload; needs to persist streak to profile</td>
      </tr>
      <tr>
        <td>Data Integrity</td>
        <td>Local storage architecture for offline-first experience</td>
        <td><a href="https://github.com/nguyenduythaibao1611-eng/calorie-web.github.io/issues/79" target="_blank" rel="noopener">PR #2 — Fix timezone bug:</a> `toISOString()` uses UTC, causing a 1-day streak offset for UTC+7 timezone</td>
      </tr>
      <tr>
        <td>UI/UX</td>
        <td>Clean dashboard design, responsive layout, animated stats page</td>
        <td>Could improve with dark mode and accessibility labels for screen readers</td>
      </tr>
    </tbody>
  </table>
</div>

<div className="section-card">
  <h4>Reviewed Team: QuickTodo</h4>
  <ul>
    <li><strong>Team / Project:</strong> QuickTodo — Task Management Application</li>
    <li><strong>Repository:</strong> <a href="https://github.com/hothong3k/QuickTodo" target="_blank" rel="noopener">github.com/hothong3k/QuickTodo</a></li>
    <li><strong>Feedback by:</strong> Tran Vo Ba Vuong (ViccVuongVicc)</li>
    <li><strong>Issue:</strong> <a href="https://github.com/hothong3k/QuickTodo/issues/30" target="_blank" rel="noopener">#30 — Guest mode: Cannot add subtask — error message lacks clear login guidance</a></li>
  </ul>
  <table>
    <thead>
      <tr><th>Aspect</th><th>Strengths</th><th>Improvement Suggestions</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>Usability</td>
        <td>Guest mode allows trying the app without sign-up, lowering entry barrier</td>
        <td>When guest tries to add subtask, the error message should include a "Log in" button; alternatively save subtasks to localStorage and offer sync on login</td>
      </tr>
      <tr>
        <td>Error Handling</td>
        <td>App detects unauthorized actions and shows error messages</td>
        <td>Error messages lack actionable guidance — user sees "You must be logged in" but has no path to resolve it</td>
      </tr>
    </tbody>
  </table>
</div>

### (b) Feedback Received (Teacher Review)

| Feedback | Source | Decision | Reason / Commit |
| --- | --- | --- | --- |
| AI Quick Add with Gemini is a highlight — should be featured more prominently in the report | Teacher | Accepted | Integrated Gemini NLP adapter into Hono API route `/api/ai/quick-add`, supporting natural language transaction input — `8b3ca4b` |
| 4-step Onboarding Wizard is great for UX — should be mentioned in self-report | Teacher | Accepted | Built 4-step onboarding wizard (personal info → wallet → budget → first transaction) with local state persistence and skip support — `fff7e94` |

<div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginTop:'1rem'}}>
  <img src="doc/screenshots/Screenshot from 2026-05-17 21-28-54.png" alt="Teacher feedback — AI Quick Add" style={{width:'100%', borderRadius:'8px'}} />
  <img src="doc/screenshots/Screenshot from 2026-05-17 21-29-59.png" alt="Teacher feedback — Onboarding Wizard" style={{width:'100%', borderRadius:'8px'}} />
</div>

## Deliverables Checklist

<ul className="checklist">
  <li className="done"><strong>Source code on GitHub</strong> — <a href="https://github.com/tducn110/Tracker_yourMoney" target="_blank" rel="noopener">github.com/tducn110/Tracker_yourMoney</a></li>
  <li className="done"><strong>README.md</strong> — Setup guide, project overview, feature list with screenshots, ERD</li>
  <li className="done"><strong>ARCHITECTURE.md</strong> — Detailed system architecture documentation</li>
  <li className="done"><strong>Video demo</strong> — <a href="https://www.youtube.com/watch?v=zAD1gF02NrU" target="_blank" rel="noopener">youtube.com/watch?v=zAD1gF02NrU</a></li>
  <li className="done"><strong>Self-Report</strong> — Each member committed file to `doc/self-report/`</li>
  <li className="done"><strong>Vercel Deployment</strong> — <a href="https://finance-for-me-local.vercel.app" target="_blank" rel="noopener">finance-for-me-local.vercel.app</a></li>
</ul>

## Appendix — Codebase Evidence

### GitNexus Code Intelligence

| Field | Value |
| --- | --- |
| **Repo indexed** | Tracker_yourMoney |
| **Path** | /home/tducn/finance-for-me-local |
| **Remote** | [github.com/tducn110/Tracker_yourMoney](https://github.com/tducn110/Tracker_yourMoney) |
| **Stats** | 308 files, 3660 symbols, 5963 relationships, 115 execution flows |

### Top Modules

UI, Services, Repositories, Quick-add, Dashboard, Routes, Budgets, Hooks, Context, Wallet, Middleware

### Main API Route Map

```text
/api/auth           /api/v1/wallet        /api/v1/analytics
/api/v1/transactions  /api/v1/bills          /api/v1/categories
/api/v1/goals         /api/v1/budgets        /api/v1/user
/api/v1/notifications /api/v1/ai             /api/v1/health
```

### Important Source Files

| File | Role |
| --- | --- |
| `apps/web/src/app/(dashboard)/page.tsx` | Dashboard layout |
| `apps/web/src/app/(dashboard)/transactions/_components/TransactionsContainer.tsx` | Transaction search/filter/sort/import/export |
| `apps/web/src/app/(dashboard)/budgets/page.tsx` | Budget CRUD UI |
| `apps/web/src/app/(dashboard)/wallets/page.tsx` | Wallet management UI |
| `apps/web/src/app/api/[[...route]]/route.ts` | Next.js to Hono API bridge on Vercel |
| `apps/api/src/index.ts` | Hono app, middleware, routing, error handling |
| `packages/api-client/src/endpoints.ts` | Typed endpoint client |
| `packages/db/src/schema/*.ts` | Drizzle database schema |
| `packages/shared-schemas/src/*.ts` | Zod validation schemas |
| `doc/wiki/erd.md` | ERD Mermaid |
| `vercel_deploy_2.log` | Evidence of successful deploy |

### Full Commit History (Last 80 Commits with Authors)

```text
Recent (May 2026)
fff7e94 feat: onboarding wizard 4 buoc - info, wallet, budget, transaction  (Chau Tuan Kiet)
a152b3b feat: integrate local onboarding wizard actions and deepseek mcp skills (Tran Vo Ba Vuong)
46ada24 Merge pull request #157 from tducn110/fix/update-lockfile              (Nguyen Tam Duc)
55beb49 chore: update pnpm-lock.yaml                                           (Tran Vo Ba Vuong)
5448dc9 Merge pull request #156 from tducn110/fix/issue-155-type-errors        (Nguyen Tam Duc)
d17a5ae fix(web): resolve type errors and normalize currency formatting         (Tran Vo Ba Vuong)
1439c58 feat(web): enhance wallet integration and analytics (#154)             (Nguyen Tam Duc)
f650aed feat(api,web): refactor dashboard and S2S engine (#152)                (Nguyen Tam Duc)
8b3ca4b feat(api,web): implement AI Quick Add with Gemini integration (#150)   (Nguyen Tam Duc)
7090921 fix: seed default categories for all users on login                    (Tran Vo Ba Vuong)
c92cfb9 fix: budget form shows only expense categories + auto-seed defaults    (Tran Vo Ba Vuong)
77b9634 fix: sync lockfile, refactor API routing for Vercel compatibility      (Tran Vo Ba Vuong)
fa1a282 fix(vercel): fix auth and api deployment as Next.js route (#144)       (Tran Vo Ba Vuong)
08d5053 feat(web): implement useMounted hook for client-side rendering (#139)  (Tran Vo Ba Vuong)
1013b1f feat(web): implement CategoryManager component                          (Tran Vo Ba Vuong)
4898849 feat(web): implement CashWalletWidget component                         (Tran Vo Ba Vuong)
613a823 feat(system): comprehensive UI refactor and auth optimization           (Tran Vo Ba Vuong)
a1847d3 Merge PR #116 from tducn110 (fix/102) — PR by Nguyen Tam Duc           (merged by Tran Vo Ba Vuong)
75928c3 fix(vercel): remove broken ignoreCommand                                (Tran Vo Ba Vuong)
804e27f fix(web): parse JSON error responses and display detailed errors (#102) (Tran Vo Ba Vuong)
1cf5543 fix(web): race condition guard in AuthProvider social login (#101)      (Tran Vo Ba Vuong)
64cbe5d fix(api): add success:false to 429 rate limit error response (#100)     (Tran Vo Ba Vuong)
a0e01a8 fix(api): raise auth route rate limit from 10 to 30 req/min (#99)       (Tran Vo Ba Vuong)
99d7143 fix(api): step tracking to /api/auth/social for debug (#98)             (Tran Vo Ba Vuong)
eb079e8 fix(api): remove dead imports for cold start optimization (#97)          (Tran Vo Ba Vuong)
1b9f7be fix(api): dynamic CORS origin support for *.vercel.app (#96)            (Tran Vo Ba Vuong)
48aed12 fix(web): parse JSON error responses and display detailed errors (#102) (Tran Vo Ba Vuong)
bfa1c11 docs: update implementation plan and backlog tasks                      (Tran Vo Ba Vuong)
c66de08 fix(db): add missing migrations for PostgreSQL and bigint IDs           (Tran Vo Ba Vuong)
4e629b1 refactor(api,db): eliminate magic strings, migrate console.* to pino    (Tran Vo Ba Vuong)
c110ddb fix: Vercel API routing, deployment prep, and debug endpoints           (Tran Vo Ba Vuong)

Collaborative (kiet00394-collab: Chau Tuan Kiet & Tran Vo Ba Vuong)
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

Nguyen Tam Duc — Phase 3-5 (AI-assisted)
a5c79b9 feat: complete feature gaps — transfer, categories, empty states (Phase 5)    (Nguyen Tam Duc + AI)
e510915 feat: wire frontend to real APIs (Phase 4)                                     (Nguyen Tam Duc + AI)
c193b16 fix(db): add walletId to transaction schemas and fix type errors (Phase 3)     (Nguyen Tam Duc + AI)
cdd727c docs: add Phase 2 completion report                                            (Nguyen Tam Duc + AI)
af1542e feat(db): sync database schema to ERD (migration 0012)                         (Nguyen Tam Duc + AI)

Mid-Phase Cleanup & Refactor
034fab6 Release: dev to main (Phase 1 + Phase 2) (#33)                                 (Tran Vo Ba Vuong)
9637add chore(db): remove unused budget_wallets table (#17)                            (Nguyen Tam Duc)
4d4aa58 chore: cleanup legacy UI components and JS schemas (#15)                       (Nguyen Tam Duc)
32a91f4 feat(ui): refactor dashboard pages to container-presentational pattern          (Nguyen Tam Duc)
9fd9950 chore: add clean mcp_config.json                                               (Nguyen Tam Duc)
60e3945 docs: reorganize documentation and add repomix-output.xml                      (Nguyen Tam Duc)
3904c75 fix(api): correct project_id casing in firebase auth init                      (Nguyen Tam Duc)
d1974e2 chore: clean up remaining AI tool directories                                  (Nguyen Tam Duc)
4340af4 feat(doc): finalize documentation reorganization and gitignore update          (Nguyen Tam Duc)

Nguyen Tam Duc — Early Phase (Foundation)
c5bc5ef Merge PR #7: implement budget-first UI and API services                        (Nguyen Tam Duc)
df74302 Merge PR #10: feature/issue-5-aesthetics                                       (Nguyen Tam Duc)
15b0798 Merge PR #9: feature/issue-4-quick-add                                         (Nguyen Tam Duc)
28f459f Merge PR #8: feature/issue-3-multi-wallet                                      (Nguyen Tam Duc)
91b63c4 Merge PR #6: feature/issue-2-budget-core                                       (Nguyen Tam Duc)
3749f98 feat(ui): implement global UI design reframing v3 aesthetics (#5)              (Nguyen Tam Duc)
3b1395d feat(quick-add): enhanced quick-add components with NLP and Simple modes (#4)  (Nguyen Tam Duc)
180fd8a feat(wallet): implement multi-wallet management and sync UI (#3)               (Nguyen Tam Duc)
10dd3c3 feat(budget): implement core budget-first infrastructure (#2)                  (Nguyen Tam Duc)
5ee3de2 feat(auth): complete migration to Firebase Social Login and Session Cookies    (Nguyen Tam Duc)
2dd223e chore: initial framework structure                                             (Nguyen Tam Duc)
```

## Self-Report

Each member committed a self-report file to `doc/self-report/self-report-[StudentID].md` in the repository.

| Full Name | Student ID | Self-Report Link |
| --- | --- | --- |
| Nguyen Tam Duc | 24020005 | [doc/self-report/self-report-24020005.md](doc/self-report/self-report-24020005.md) |
| Tran Vo Ba Vuong | 24020008 | [doc/self-report/self-report-24020008.md](doc/self-report/self-report-24020008.md) |
| Chau Tuan Kiet | 24020010 | [doc/self-report/self-report-24020010.md](doc/self-report/self-report-24020010.md) |

Final Project Report — Finance Tracker V3 | Team Antigravity | Submission Date: 15/05/2026
