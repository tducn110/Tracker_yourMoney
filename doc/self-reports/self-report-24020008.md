## Personal Information

| | |
|---|---|
| **Full Name** | Tran Vo Ba Vuong |
| **Student ID** | 24020008 |
| **Team** | Antigravity |
| **Role in Team** | Frontend refactor / Auth-hardening / Middleware / Deployment fixes |

The timeline below follows the original team plan. GitHub issues, PRs, and commits are used as contribution evidence, not as a replacement for the planned task schedule.

---

## Task 1 — Planning & Setup

**Week:** Planning phase, 10/04/2026 - 18/04/2026

**Work completed:**

- Created a large issue backlog for frontend, analytics, automation, testing, and backend hardening so the team had clearly defined tasks.
- Participated in the release phase from `dev` to `main` and helped maintain an issue-driven branch workflow.
- Built issue chains for dashboard, budgets, goals, bills, settings, categories/notifications, and testing-related refactor work.

**Contribution evidence:**

- Issues `#34` through `#75` were mostly created by `ViccVuongVicc` on 01/05/2026.
- PR `#13` `feature/issue-102-frontend-refactor` merged 27/04/2026.
- PR `#27`, `#29`, `#30`, `#31`, and `#33` show my involvement in release flow and database/docs phases.
- Git shortlog shows `ViccVuongVicc` with 44 commits using GitHub noreply email, plus 2 more commits with a personal email.

**Difficulties encountered:**

- The initial backlog was broad and highly connected, so tasks had to be split small enough that the team could still merge near the deadline without major conflicts.

**Self-evaluation:** 8.5/10

---

## Task 2 — UI Implementation

**Week:** UI implementation phase, 18/04/2026 - 05/05/2026

**Work completed:**

- Performed frontend refactors across major dashboard areas using container/presentational separation, React Query, optimistic updates, localization, and real API wiring.
- Built or finalized UI/UX pieces such as `CategoryManager`, `CashWalletWidget`, `useMounted`, login UI, budgets/bills/goals refinements, and empty states.
- Participated in final sync and UI polish, including accessibility, contrast, heading hierarchy, and PageSpeed work.

**Contribution evidence:**

- PR `#13` Frontend refactor.
- PR `#78`, `#80`, `#82`, and `#83` covered locales, feature gaps, React Query, and login UI.
- PR `#140` `feature/issue-129-136-system-refactor` merged 09/05/2026.
- PR `#141`, `#142`, and `#143` covered `useMounted`, `CategoryManager`, and `CashWalletWidget`.
- PR `#168` fix accessibility/PageSpeed, merge 16/05/2026.

**Difficulties encountered:**

- Many screens looked like pure UI work but were actually blocked by hydration, auth state, or response-shape issues; I had to change hooks, API client behavior, and rendering guards instead of only changing layout.

**Self-evaluation:** 9/10

---

## Task 3 — Database Integration

**Week:** Database and API integration phase, 15/04/2026 - 05/05/2026

**Work completed:**

- Helped align schema, migrations, and PostgreSQL compatibility during phase 1-2 and in later hotfix rounds.
- Implemented backend changes tied directly to data correctness, including budget service refactor, goal/bill service cleanup, BigInt-safe serialization, query scoping, wallet concurrency, and pino logging.
- Supported production auth/API fixes such as rate limits, CORS, social auth debugging, and the embedded Hono route.

**Contribution evidence:**

- PR `#29` sync schema to ERD.
- PR `#106` Finance Engine Optimization & Logging Standard.
- PR `#109`, `#110`, `#111`, `#112`, `#113`, `#114`, `#115`, and `#116` covered CORS, cold-start cleanup, auth debugging, rate limits, and error UX.
- PR `#145` and `#146` covered Vercel API deployment compatibility.
- Issues `#96` through `#105` were created and closed by `ViccVuongVicc` on 06/05/2026, matching the backend/hardening fixes.

**Difficulties encountered:**

- End-stage production bugs were usually crossover bugs between frontend and API, so debugging required tracing auth flow and deployment behavior rather than looking at isolated files.

**Self-evaluation:** 9/10

---

## Task 4 — Optimization

**Week:** Optimization and deployment phase, 05/05/2026 - 15/05/2026

**Work completed:**

- Optimized production stability by adding dynamic CORS for `*.vercel.app`, removing imports that caused cold starts, adding step tracking to `/api/auth/social`, and fixing the `AuthProvider` race condition.
- Cleaned up error UX, logging behavior, lockfile state, and branch sync to reduce integration failures.
- Participated in the final accessibility/PageSpeed pass to improve a11y and reduce console noise before submission.

**Contribution evidence:**

- PR `#109` through `#116` merged on 06/05/2026.
- PR `#145`, `#146` merged 09/05/2026.
- PR `#157` merged 11/05/2026.
- Commit 17/05/2026: `fix: a11y & best practices improvements from PageSpeed audit`.

**Difficulties encountered:**

- Many optimization fixes were small in code but had large blast radius, such as auth rate limits, the embedded API route, and hydration guards; changing them too quickly could break other flows.

**Self-evaluation:** 9/10

---

## Task 5 — Peer Review

**Week:** Review and final integration phase, 12/05/2026 - 15/05/2026

**Work completed:**

- Worked through an issue -> branch -> PR -> merge process and handled internal feedback through review requests and follow-up commits.
- Created many issues that I then implemented myself or in collaboration with teammates, which made task assignment clearer inside the team.
- Helped sync branches and release branches to bring changes from `dev` and feature branches back into `main`.

**Contribution evidence:**

- PR `#114` has a review request to `kiet00394-collab`, while PR `#113` and `#112` include review requests to both `tducn110` and `kiet00394-collab`.
- PR `#32` and `#140` include review requests from my side to `tducn110`.
- PR `#33` là release `dev` -> `main`.
- PR `#163` and the `chore: sync latest changes` commit show sync/rebase-like integration before the final merge phase.
- The repository does not store many formal review comments; most review evidence is visible through review requests, follow-up commits, and merge chains.

**Difficulties encountered:**

- Because most feedback happened quickly inside the team and was reflected directly in the next commit, the GitHub review trail is not as complete as in a formal enterprise workflow.

**Self-evaluation:** 8.5/10

---

## Overall Personal Contribution Summary

**Summary of my contribution to the project:**

I contributed heavily to UI refactoring, issue backlog organization, auth/middleware hardening, and production deployment fixes. The largest part of my work was turning incomplete screens and flows into real API-backed flows, then continuing to optimize them to reduce auth, CORS, hydration, and error-UX problems. The work I am most satisfied with is the `#96` to `#116` fix chain, the issue-driven UI refactor PRs, and the final accessibility/PageSpeed pass.

**Estimated contribution compared to the whole team:** ~40%

**Overall self-evaluation:** 9/10
