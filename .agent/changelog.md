# .agent Changelog (S2S Finance)

## [2026-04-20] - GitNexus Integration (The Intelligence Upgrade)
### Added
- **GitNexus MCP** as mandatory tool in `agents.md` and `coding-style.md`.
- **Impact Analysis** step added to `plan.md` and `github.md` workflows.
- **Code Intelligence Checklist** in `coding-standards.md`.
- **Impact-Driven Security Review** section in `security.md`.
- **Development Tools & Intelligence** section in `project-context.md`.

## [2026-04-19] - Full .agent overhaul for S2S Finance stack
**Session:** Full .agent overhaul for S2S Finance stack

## Summary of Changes

### 1. Context Files (`.agent/context/`)
- **`dev.md`**: Updated to emphasize Financial Integrity role, TypeScript strictness, and monorepo commands (`pnpm`).
- **`research.md`**: Added guidance for exploring the monorepo and using Drizzle Studio.
- **`review.md`**: Refined checklist to include financial precision checks (`Decimal.js`, `BigInt`).

### 2. Rules (`.agent/rules/`)
- **Common Rules (`common/`)**:
  - `coding-style.md`: Added financial precision section, TypeScript "no any" rule, and `Decimal.js` examples.
  - `patterns.md`: Added Repository pattern with Drizzle, DI container, and OCC/idempotency patterns.
  - `security.md`: Added financial-specific security (HttpOnly cookies, idempotency, OCC, audit logging).
  - `testing.md`: Updated with Vitest, Playwright, and 100% coverage requirement for financial functions.
  - `git-workflow.md`: Implemented rebase-based workflow with `dev`/`main` branches and issue-driven naming.
  - `agents.md`: Removed `rust-reviewer`, added financial-specific agent guidance.
  - `hooks.md`: Simplified to only essential hooks (no tmux, no auto-format).
  - `performance.md`: **Deleted** (model selection not applicable to Antigravity IDE).

- **TypeScript Rules (`typescript/`)**:
  - All files updated with project-specific examples (Hono response helpers, Drizzle queries, React Query hooks).

- **Root Rules**:
  - `coding-standards.md`: Updated "Constitution" to use `Decimal.js` and `pnpm`. Removed "Mascot Mood" (not implemented).
  - `security-context.md`: Converted to English, added Idempotency as 5th core rule, clarified application-level row isolation.

### 3. Skills (`.agent/skills/`)
- **Deleted**: All skills unrelated to TypeScript/Next.js/Hono stack (Django, Laravel, Spring Boot, Go, Python, Java, ClickHouse, JPA, PostgreSQL, content creation, media, etc.).
- **Retained (14 skills)**: `api-design`, `architecture-decision-records`, `backend-patterns`, `blueprint`, `codebase-onboarding`, `database-migrations`, `deployment-patterns`, `docker-patterns`, `documentation-lookup`, `frontend-patterns`, `nextjs-turbopack`, `security-review`, `security-scan`, `tdd-workflow`.
- **Modified**: `security-review` (merged YAML metadata into SKILL.md, removed `cloud-infrastructure-security.md`).

### 4. Hooks (`.agent/hooks/`)
- **`hooks.json`**: Stripped down to only essential hooks: `git-push-reminder`, `post-edit:typecheck`, `post-edit:console-warn`, `stop:check-console-log`.
- **`README.md`**: Updated to reflect simplified hook set.

### 5. Workflows (`.agent/workflows/`)
- **`deploy.md`**: Updated for `pnpm`, Vercel, TiDB migrations (`db:migrate`).
- **`github.md`**: Updated branch naming (`feature/issue-<ID>-...`) and rebase workflow.
- **`plan.md`**: Added monorepo-specific planning steps and template.

### 6. New Files
- **`project-context.md`**: Created with stack overview, critical paths, financial rules, and common commands.

## How to Recover
If any future changes break the configuration, restore the `.agent` folder from this commit:

```bash
git checkout <commit-hash> -- .agent