## Personal Information

| | |
|---|---|
| **Full Name** | Nguyen Tam Duc |
| **Student ID** | 24020005 |
| **Team** | proPlayer |
| **Role in Team** | Team lead / Architecture / Backend / Database / Deployment integration |

---

## Task 1 — Planning & Setup

**Week:** Planning phase, 10/04/2026 – 18/04/2026

**Work completed:**

- Defined the Budget-First architecture direction and organized the monorepo into `apps/web`, `apps/api`, `apps/worker`, `packages/db`, `packages/api-client`, `packages/shared-schemas`, and `packages/cache`.
- Created and managed the early foundation issues: `#2` Budget-First core, `#3` Multi-Wallet, `#4` Quick Add, `#5` UI reframing, `#11` Firebase session cookie migration, `#17` unused table cleanup, and `#24` backend error handling.
- Established the branch naming convention `feature/issue-*` and `fix/*`, and maintained a PR-based workflow into `main` or `dev`.
- Reorganized project documentation so the team had a shared source of truth during development and final submission.

**Contribution evidence:**

- Issues `#2`, `#3`, `#4`, `#5`, `#11`, `#17`, and `#24` were created and assigned through the `tducn110` account.
- PR `#6` `feature/issue-2-budget-core` merged 25/04/2026.
- PR `#8` `feature/issue-3-multi-wallet` merged 25/04/2026.
- PR `#9` `feature/issue-4-quick-add` merged 25/04/2026.
- PR `#10` `feature/issue-5-aesthetics` merged 25/04/2026.
- PR `#12` `feature/issue-101-reorganize-docs` merged 26/04/2026.
- Git identities: `tducn`, `tdu._cn`, `tducn110`.

**Difficulties encountered:**

- Early project documentation and active code were not fully aligned, so I had to standardize structure while keeping the team unblocked on schema and contract work.

**Self-evaluation:** 10/10

---

## Task 2 — UI Implementation

**Week:** UI implementation phase, 18/04/2026 – 05/05/2026

**Work completed:**

- Built core UI work tightly coupled to domain logic: Budget-First core, Multi-Wallet, Quick Add, and the V3 global UI reframing.
- Drove cross-layer flows that required both web and API changes: AI Quick Add, Dashboard and Safe-to-Spend refactor, Wallet integration, and analytics.
- Reviewed implementation direction for onboarding, dashboard, budget, and wallet flows so the screens stayed aligned with shared data contracts.

**Contribution evidence:**

- PR `#150` `feature/issue-149-ai-quick-add` merged 11/05/2026.
- PR `#152` `feature/issue-151-dashboard-refactor` merged 11/05/2026.
- PR `#154` `feature/issue-153-wallet-analytics` merged 11/05/2026.
- PR `#140` and `#159` include `reviewRequests` to `tducn110`, showing my participation in internal review before merge.

**Difficulties encountered:**

- The UI could not be treated separately from the backend because financial widgets depended on budget summaries, wallet state, and API response shapes; I had to adjust both interfaces and contracts together.

**Self-evaluation:** 10/10

---

## Task 3 — Database Integration

**Week:** Database integration phase, 15/04/2026 – 05/05/2026

**Work completed:**

- Designed and maintained the financial data model with Drizzle for PostgreSQL/Supabase, including users, wallets, transactions, budgets, goals, bills, notifications, and audit logs.
- Standardized shared schemas and typed contracts between frontend and backend to reduce type mismatch risk.
- Supported backend changes related to Safe-to-Spend, analytics, auth sessions, wallet flows, and deployment-compatible API routing.

**Contribution evidence:**

- PR `#6` Budget-First infrastructure.
- PR `#7` and issue `#11` related to Firebase Social Login and Session Cookies.
- Issue `#24` Backend Error Handling Standardization.
- PR `#145` merged 09/05/2026: embedded the Hono API into the Next.js catch-all route so production could use a single deployment path.
- The commit timeline for `tducn` and `tdu._cn` runs from 22/04 to 17/05 and is concentrated on auth, budget, wallet, API, and integration work.

**Difficulties encountered:**

- The hardest part was keeping financial logic, auth flow, and deployment strategy consistent while the active codebase had already shifted to PostgreSQL-oriented Drizzle and some older documents still described a different stack.

**Self-evaluation:** 10/10

---

## Task 4 — Optimization

**Week:** Optimization and deployment phase, 05/05/2026 – 15/05/2026

**Work completed:**

- Finalized the production deployment strategy by embedding the Hono API into `apps/web/src/app/api/[[...route]]/route.ts`.
- Participated in branch sync, lockfile cleanup, config cleanup, and the final accessibility/PageSpeed fixes.
- Supported final integration to reduce conflict risk while multiple contributors were committing near the deadline.

**Contribution evidence:**

- PR `#145` merged 09/05/2026.
- PR `#157` merged 11/05/2026.
- PR `#163` `feature/sync-latest-changes` merged 16/05/2026.
- PR `#168` `fix/accessibility-page-speed` merged 16/05/2026.

**Difficulties encountered:**

- End-phase optimization was not just about fixing isolated bugs; I also had to absorb diverged branches, check side effects, and merge in the right order.

**Self-evaluation:** 10/10

---

## Task 5 — Peer Review

**Week:** Review and final integration phase, 12/05/2026 – 15/05/2026

**Work completed:**

- Regularly received `reviewRequest`s in the repository and checked implementation direction before changes were merged into `main`.
- Gave internal feedback on branch naming, how to split issues into smaller PRs, and how to merge phase by phase instead of merging one large batch.
- Performed merges for foundation PRs and release/sync branches when the team needed to consolidate work.

**Contribution evidence:**

- `reviewRequests` to `tducn110` appear in PR `#27`, `#32`, `#78`, `#110`, `#111`, `#113`, `#115`, `#140`, and `#159`.
- Merge commits are visible under the `tdu._cn` identity, including merges for PR `#6`, `#8`, `#9`, `#10`, and `#157`.
- The repository does not show clear evidence of inter-group peer review; the verifiable part is internal team review through PR flow and merge history.

**Difficulties encountered:**

- GitHub history contains review requests but almost no formal review comments, so tracking feedback required reading PR chains, follow-up commits, and merge timing.

**Self-evaluation:** 10/10

---

## Overall Personal Contribution Summary

**Summary of my contribution to the project:**

I was responsible for the overall architecture and for the integration points between frontend, backend, database, and deployment. My main contributions were building the monorepo foundation, defining the Budget-First direction, keeping schemas and typed contracts consistent across layers, and locking down a deployment approach that worked on Vercel. Beyond coding, I also helped coordinate issues, branches, merges, and internal review so the team could integrate the final submission without breaking the architecture.

**Estimated contribution compared to the whole team:** ~35%

**Overall self-evaluation:** 10/10
