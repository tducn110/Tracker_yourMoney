# Finance Tracker — Final Project Requirements & Gap Analysis

**Based on:** Standard Web Development Course Final Project Brief
**Date:** 2026-04-20
**Objective:** Align Finance Tracker with academic/industry standard project deliverables.

---

## 1. Project Planning & Teamwork (Task 1 Equivalent)

### Requirements Mapping

| Req ID    | Requirement                                                        | Finance Tracker Status | Action Needed                                                                                      |
| --------- | ------------------------------------------------------------------ | ------------------ | -------------------------------------------------------------------------------------------------- |
| **PL-01** | Team meeting to assign roles and responsibilities                  | ⚠️ **Partial**     | Document roles in `README.md` or `CONTRIBUTING.md`.                                                |
| **PL-02** | Create wireframes for the application                              | ❌ **Missing**     | Create Figma/Excalidraw wireframes for Dashboard, Transactions, Goals. Save in `/docs/wireframes`. |
| **PL-03** | Develop a project plan with milestones and deadlines               | ⚠️ **Partial**     | Use `plans/` directory with Blueprint outputs. Add a `ROADMAP.md` file.                            |
| **PL-04** | Setup GitHub repository with branch protection and issues          | ✅ **Complete**    | Branches: `main`, `dev`. Issue-driven workflow defined in `.agent/workflows/github.md`.            |
| **PL-05** | Utilize GitHub Workflow and best practices for Git commit messages | ✅ **Complete**    | Conventional Commits enforced. PR template exists.                                                 |

### Deliverables for This Section

- [ ] Add `docs/wireframes/` folder with 3-5 core page wireframes.
- [ ] Add `ROADMAP.md` summarizing project phases.
- [ ] Update `README.md` with team roles section.

---

## 2. User Interface Implementation (Task 2 Equivalent)

### Requirements Mapping

| Req ID    | Requirement                                                | Finance Tracker Status | Action Needed                                                                                           |
| --------- | ---------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------- |
| **UI-01** | Multi-page website (at least 3 pages) following wireframes | ✅ **Complete**    | Dashboard (`/`), Transactions (`/transactions`), Goals (`/goals`), Bills, Analytics, Settings.          |
| **UI-02** | Use Tailwind CSS to style the website                      | ✅ **Complete**    | Tailwind CSS v4 configured with `@tailwindcss/postcss`.                                                 |
| **UI-03** | Add interactivity using JavaScript                         | ✅ **Complete**    | React (Next.js) with extensive use of `useState`, `useEffect`, event handlers, and `motion` animations. |
| **UI-04** | Fully responsive design for all screen sizes               | ✅ **Complete**    | Mobile-first Tailwind classes. Sidebar collapses on mobile.                                             |

### Deliverables for This Section

- [ ] Verify all pages match wireframes (create wireframes first if missing).

---

## 3. Database Integration & Dynamic Content (Task 3 Equivalent)

### Requirements Mapping

| Req ID    | Requirement                                                           | Finance Tracker Status | Action Needed                                                                                                     |
| --------- | --------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| **DB-01** | Design a database schema suitable for the application                 | ✅ **Complete**    | Full Drizzle schema (`users`, `transactions`, `goals`, `bills`, etc.) documented in `doc/update/DATABASE_ALL.md`. |
| **DB-02** | Integrate a MySQL/PostgreSQL database                                 | ✅ **Complete**    | TiDB Serverless (MySQL-compatible) connected via Drizzle ORM.                                                     |
| **DB-03** | Create at least two dynamic pages that display data from the database | ✅ **Complete**    | Dashboard (Budget Hero, Transactions list), Transactions page, Goals page all fetch real data.                       |

### Deliverables for This Section

- [ ] Ensure ERD diagram is included in final report (`README.md` or `docs/ERD.png`).

---

## 4. Optimization & Monitoring (Task 4 Equivalent)

### Requirements Mapping

| Req ID     | Requirement                                                | Finance Tracker Status | Action Needed                                                                                                     |
| ---------- | ---------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| **OPT-01** | Optimize website for Google Lighthouse performance metrics | ⚠️ **Partial**     | Run Lighthouse audit. Optimize images (use `next/image`), add metadata for SEO.                                   |
| **OPT-02** | Setup Tracking and Logging tools                           | ⚠️ **Partial**     | **Logging:** `pino` configured in `apps/api`. **Tracking:** Google Analytics or Plausible **not yet integrated**. |

### Deliverables for This Section

- [ ] Run Lighthouse on deployed Vercel preview and document scores in `README.md`.
- [ ] Integrate `@vercel/analytics` for basic traffic tracking (free & easy).
- [ ] Implement Next.js `<Metadata>` for SEO titles/descriptions.

---

## 5. UI/UX Peer Review & Evaluation (Task 5 Equivalent)

### Requirements Mapping

| Req ID    | Requirement                            | Finance Tracker Status | Action Needed                                                                   |
| --------- | -------------------------------------- | ------------------ | ------------------------------------------------------------------------------- |
| **UX-01** | Provide constructive feedback to peers | ⚠️ **Pending**     | Schedule a review session or use GitHub Discussions to review similar projects. |
| **UX-02** | Implement feedback received from peers | ⚠️ **Pending**     | Document changes in `CHANGELOG.md` or PR descriptions.                          |

### Deliverables for This Section

- [ ] Create `docs/peer-review-feedback.md` to log feedback and action items.

---

## Summary: Gap Analysis & Immediate Action Items

| Priority  | Category      | Action Item                                                           |
| --------- | ------------- | --------------------------------------------------------------------- |
| 🔴 High   | Planning      | Create **Wireframes** for core pages (Figma/Excalidraw).              |
| 🔴 High   | Documentation | Create **ERD Diagram** (export from Drizzle Studio or draw manually). |
| 🟡 Medium | Optimization  | Setup **Vercel Analytics** and run **Lighthouse** audit.              |
| 🟡 Medium | Documentation | Add **Project Plan / Roadmap** to `README.md`.                        |
| 🟢 Low    | Process       | Conduct **Peer Review** and document feedback.                        |

---

## Final Deliverables Checklist (For Submission)

- [ ] **Source Code:** GitHub repository with `main` and `dev` branches, clean commit history.
- [ ] **README.md:** Includes project overview, features list with screenshots, setup instructions, ERD diagram, and Lighthouse scores.
- [ ] **Wireframes:** Included in `/docs` or linked in README.
- [ ] **Demo Video:** 10-minute screencast (YouTube unlisted) demonstrating all features.

---

_This document serves as a blueprint to ensure Finance Tracker meets or exceeds standard academic and professional project requirements._
