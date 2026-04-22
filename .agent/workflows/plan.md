---
description: Planning Workflow for S2S Finance Features
---

# 📝 Planning Workflow (S2S Finance)

Follow this workflow whenever a new feature, significant refactor, or architecture change is requested. The goal is to produce a clear, actionable plan before any code is written.

## 1. Initial Assessment
- Read the issue description or user request.
- **GitNexus Code Intelligence**:
  - Run `mcp_gitnexus_query({query: "concept"})` to discover existing implementation patterns and execution flows.
  - Run `mcp_gitnexus_context({name: "symbolName"})` for 360-degree view of core symbols involved.
- Identify impacted areas of the monorepo:
  - `apps/web` (Next.js frontend)
  - `apps/api` (Hono backend)
  - `packages/db` (Drizzle schemas)
  - `packages/shared-schemas` (Zod validation)
- Determine if this is a **feature**, **bug fix**, or **architectural change**.
- Consult `.agent/project-context.md` for stack details and critical paths.

## 2. Scope & Impact Analysis
- **Blast Radius (GitNexus)**: Run `mcp_gitnexus_impact({target: "targetName", direction: "upstream"})` on any symbol to be modified. Report risk level (LOW/MEDIUM/HIGH/CRITICAL) to the user.
- **Database**: Will this require schema changes? If yes, plan a Drizzle migration.
- **API Contract**: Will new endpoints be added or existing ones modified? Use `mcp_gitnexus_api_impact` to check consumer impact.
- **Frontend**: Which pages/components will be affected? Will new React Query hooks be needed?
- **Security**: Does this change involve financial data? If yes, ensure idempotency, OCC, and audit logging are considered.
- **Performance**: Consider impact on S2S calculation and cold start times.

## 3. Design & Architecture
- For complex features, use the **blueprint** skill to generate a step-by-step construction plan.
- Alternatively, invoke the **architect** agent to evaluate trade-offs and produce an ADR (Architecture Decision Record) if needed.
- Define the data flow: `UI → Server Action / API Client → Hono Route → Service → Repository → TiDB`.

## 4. Data Modeling (if applicable)
- Define new tables or columns in `packages/db/src/schema/`.
- Plan the migration: `pnpm db:generate` → review generated SQL → `pnpm db:migrate`.
- Update `packages/db/src/repositories/` with new query methods.

## 5. API Design
- Define new routes in `apps/api/src/routes/`.
- Write Zod schemas for request/response validation in `packages/shared-schemas/`.
- Use response helpers (`ok`, `created`, `err`) from `apps/api/src/lib/response.ts`.
- Consider rate limiting for new endpoints.

## 6. Frontend Integration
- Create or update React Query hooks in `apps/web/src/_lib/hooks/`.
- Build UI components in `apps/web/src/_components/`.
- Implement optimistic updates where appropriate (especially for financial mutations).

## 7. Testing Strategy
- **Unit Tests**: Vitest for services, utilities, and components.
- **Integration Tests**: Test API routes and database interactions.
- **E2E Tests**: Playwright for critical user journeys.
- **Financial Tests**: 100% coverage for any function performing monetary calculations.

## 8. Execution Phasing & Task Breakdown
- Break the plan into small, reviewable PRs (ideally one concern per PR).
- Identify dependencies between tasks (e.g., "Schema migration must be merged before API changes").
- Document the plan in `plans/YYYY-MM-DD-feature-name.md` using the template below.

## 9. Execute Plan Generation
When the assessment is complete, use the **planner** agent or the **blueprint** skill to generate a detailed plan file in the `plans/` directory at the monorepo root.

### Plan Document Template
```markdown
# Plan: [Feature Name]

**Date:** YYYY-MM-DD
**Issue:** #<issue-number>
**Status:** Planning

## Objective
[1-2 sentences describing the goal]

## Scope & Impact
- **Database:** [Yes/No - describe changes]
- **API:** [New/Modified endpoints]
- **Frontend:** [Pages/Components affected]

## Technical Design
### Data Model
[Relevant Drizzle schema changes]

### API Contract
[New endpoints with request/response shapes]

### UI/UX Considerations
[Describe user interactions]

## Tasks
- [ ] Task 1: Create database migration (PR #1)
- [ ] Task 2: Implement API endpoint (PR #2)
- [ ] Task 3: Add frontend integration (PR #3)
- [ ] Task 4: Write tests and update docs

## Risks & Mitigations
- [Risk 1]: [Mitigation strategy]

## Definition of Done
- [ ] Code merged to `dev`
- [ ] Tests passing (coverage ≥ 80%)
- [ ] Feature flag removed (if applicable)
- [ ] Documentation updated