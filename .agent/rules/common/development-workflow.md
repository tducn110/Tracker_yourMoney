---
trigger: always_on
---

# Development Workflow (S2S Finance)

> This file extends [common/git-workflow.md](./git-workflow.md) with the full feature development process that happens before git operations.

The Feature Implementation Workflow describes the development pipeline: research, planning, TDD, code review, and then committing to git.

## Feature Implementation Workflow

### 0. Research & Reuse *(mandatory before any new implementation)*

- **Check existing packages first:** Search the monorepo (`packages/`, `apps/`) for similar utilities or patterns.
- **Library docs:** Use Context7 or official docs for Next.js, Hono, Drizzle, and TiDB before implementing.
- **Prefer ecosystem libraries:** Look for well-maintained npm packages (e.g., `decimal.js`, `zod`, `jose`) over hand-rolled solutions.
- **Search for adaptable implementations:** Look for open-source finance trackers or SaaS boilerplates that can be referenced.

### 1. Plan First

- Use **planner** agent to create implementation plan
- Generate planning docs before coding: feature spec, API contract (Zod schemas), database schema changes (Drizzle)
- Identify dependencies and risks (especially financial precision)
- Break down into phases, each deliverable as a focused PR

### 2. TDD Approach

- Use **tdd-guide** agent
- Write tests first (RED)
  - Unit tests for services and utilities
  - Integration tests for API endpoints
  - E2E tests for critical user flows (Playwright)
- Implement to pass tests (GREEN)
- Refactor (IMPROVE)
- Verify 80%+ coverage, with **100% coverage on financial calculation functions**

### 3. Code Review

- Use **code-reviewer** agent immediately after writing code
- Address CRITICAL and HIGH issues, especially:
  - Precision: `Decimal.js` usage, no `parseFloat` on money
  - Security: JWT in HttpOnly cookie, idempotency, SQL injection
  - Type safety: no `any`, correct Drizzle types
- Fix MEDIUM issues when possible

### 4. Commit & Push

- Detailed commit messages following [Conventional Commits](https://www.conventionalcommits.org/)
- Follow PR process: feature branch → PR to `dev` → squash merge
- See [git-workflow.md](./git-workflow.md) for commit message format and PR process