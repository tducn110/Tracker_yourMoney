## Personal Information

| | |
|---|---|
| **Full Name** | Chau Tuan Kiet |
| **Student ID** | 24020010 |
| **Team** | Antigravity |
| **Role in Team** | Frontend / Onboarding / Feature integration / Support fixes |

The timeline below follows the original team plan. GitHub issues, PRs, and commits are used as contribution evidence, not as a replacement for the planned task schedule.

---

## Task 1 — Planning & Setup

**Week:** Planning phase, 10/04/2026 - 18/04/2026

**Work completed:**

- Participated in the early phases related to auth and feature completion through issue-based branches.
- Took on tasks related to frontend integration, feature-gap closing, login UI, and automation/settings work.
- Coordinated with the team during the acceleration phases in early May when many features had to land in parallel.

**Contribution evidence:**

- PR `#1` `feature/issue-1-firebase-session-auth` authored by `kiet00394-collab`, merged 25/04/2026.
- PR `#76`, `#78`, `#80`, `#82`, `#83`, `#85`, `#86`, `#88`, `#90`, `#92`, `#94`, `#141`, `#142`, `#143`, and `#159` were all authored by `kiet00394-collab`.
- Git shortlog shows `kiet00394-collab` with 11 commits, plus 1 commit under the name `Chau Tuan Kiet`.

**Difficulties encountered:**

- The feature load in the middle phase increased very quickly, so I had to prioritize the work that would let the UI connect to real APIs first.

**Self-evaluation:** 8/10

---

## Task 2 — UI Implementation

**Week:** UI implementation phase, 18/04/2026 - 12/05/2026

**Work completed:**

- Implemented and completed the 4-step onboarding wizard: personal information, wallet, budget, and transaction.
- Worked on frontend integration such as dashboard localization, login UI, React Query, optimistic updates, real API wiring, and type/UI warning cleanup.
- Supported components and page-level flows related to wallets, categories, cash wallet, notifications/settings, and remaining dashboard feature gaps.

**Contribution evidence:**

- PR `#159` `feat/onboarding-wizard` merged on 13/05/2026 and includes a review request to `tducn110`.
- PR `#78` locales.
- PR `#80` complete feature gaps.
- PR `#82` frontend refactor, React Query, optimistic updates.
- PR `#83` login UI enhancement.
- PR `#141`, `#142`, and `#143` covered `useMounted`, `CategoryManager`, and `CashWalletWidget`.

**Difficulties encountered:**

- Once the UI was connected to real APIs, many areas had to be reworked for empty state, loading state, type errors, and the gap between mock flows and production flows.

**Self-evaluation:** 8.5/10

---

## Task 3 — Database Integration

**Week:** Database and API integration phase, 15/04/2026 - 05/05/2026

**Work completed:**

- Participated in fixes directly tied to data correctness and financial integrity, including `walletId` schema updates, worker DB environment fixes, cache headers, PostgreSQL synchronization, and wallet balance sync.
- Supported feature integration work where the frontend only behaved correctly after schema and API payload fixes were also applied.

**Contribution evidence:**

- PR `#76` `fix(db): add walletId to transaction schemas and fix type errors`.
- PR `#92` `fix/issue-91-worker-firebase-cache-updates`.
- PR `#94` `fix/issue-93-financial-logic-sync`.
- Commit 04/05/2026: `fix(api,worker,web,db): financial logic integrity — wallet OCC, audit trails, PostgreSQL compat, boolean schemas`.

**Difficulties encountered:**

- Financial logic and synchronization bugs were very sensitive; one incorrect field or one incorrect balance update could affect many screens.

**Self-evaluation:** 8/10

---

## Task 4 — Optimization

**Week:** Optimization and onboarding completion phase, 05/05/2026 - 15/05/2026

**Work completed:**

- Reduced warnings and type errors so the team could build and merge faster.
- Supported worker/config fixes, cache headers, frontend polish, and the login/onboarding experience.
- Participated in integrating a large feature branch, then helped handle the onboarding revert so production flow would not be affected.

**Contribution evidence:**

- PR `#85` Resolve typechecking and UI warnings.
- PR `#90` backend scale & UI tailwind v4 fixes.
- Issue `#158` and PR `#159` for the onboarding wizard; that branch was later reverted in PR `#162`, showing the feedback and optimization loop after integration.
- Commit 13/05/2026: `feat: onboarding wizard 4 buoc - info, wallet, budget, transaction`.

**Difficulties encountered:**

- Onboarding is a long flow, so even a small auth or state-handling mismatch could affect the entire wizard; optimization had to be paired with real post-merge validation.

**Self-evaluation:** 8/10

---

## Task 5 — Peer Review

**Week:** Review and final integration phase, 12/05/2026 - 15/05/2026

**Work completed:**

- Participated in the internal review process by receiving review requests on hardening/auth PRs and adjusting code after integration feedback.
- Coordinated with the team lead to finalize the onboarding wizard and handle the revert once fake auth behavior was found to be unsuitable for production.

**Contribution evidence:**

- PR `#112`, `#113`, and `#114` include review requests to `kiet00394-collab`.
- PR `#159` includes a review request to `tducn110`, and the changes were later reevaluated and reverted through PR `#162`.
- The repository does not contain detailed formal review comments; peer review evidence mainly appears through review requests, merge timing, and follow-up PR chains.

**Difficulties encountered:**

- Team feedback happened quickly and was often reflected in the next commit or PR instead of being fully documented in GitHub comments.

**Self-evaluation:** 7.5/10

---

## Overall Personal Contribution Summary

**Summary of my contribution to the project:**

I focused on frontend-facing user flows, especially onboarding, login experience, real API wiring, and support fixes that made the product more usable. During the peak delivery phase in early May, I contributed to many phase-based PRs that closed feature gaps, reduced type/UI warnings, and fixed issues related to financial logic or worker/config behavior when they affected the interface directly. The part I am most proud of is the onboarding wizard and the set of changes that reduced the frontend’s dependence on mock data.

**Estimated contribution compared to the whole team:** ~25%

**Overall self-evaluation:** 8/10
