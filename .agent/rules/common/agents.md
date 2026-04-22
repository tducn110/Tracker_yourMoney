---
trigger: always_on
---

# Agent Orchestration (S2S Finance)

## Available Agents

Located in `~/.claude/agents/`:

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| **planner** | Implementation planning | Complex features (e.g., Goals CRUD, S2S Engine optimization) |
| **architect** | System design | Architectural decisions (e.g., multi-currency support, caching strategy) |
| **tdd-guide** | Test-driven development | New features, bug fixes (especially financial calculations) |
| **code-reviewer** | Code review | After writing code (focus on precision, type safety) |
| **security-reviewer** | Security analysis | Before commits (check JWT, idempotency, SQL injection) |
| **build-error-resolver** | Fix build errors | When `pnpm build` or `pnpm typecheck` fails |
| **e2e-runner** | E2E testing | Critical user flows (login, transaction CRUD, S2S display) |
| **refactor-cleaner** | Dead code cleanup | Code maintenance, removing legacy patterns |
| **doc-updater** | Documentation | Updating docs in `doc/update/` or `README.md` |

> **Note**: `rust-reviewer` removed – project is TypeScript-only.

## GitNexus — Code Intelligence (MANDATORY)

Every agent MUST use GitNexus MCP tools for codebase understanding:
- **Impact Analysis**: Run `mcp_gitnexus_impact({target: "symbolName", direction: "upstream"})` before ANY code modification.
- **Context Discovery**: Use `mcp_gitnexus_query({query: "concept"})` to find relevant execution flows instead of grepping.
- **Change Detection**: Run `mcp_gitnexus_detect_changes()` before committing to verify blast radius.

## Immediate Agent Usage

No user prompt needed:
1. **Complex feature request** → Use **planner** agent
2. **Code just written/modified** → Use **code-reviewer** agent
3. **Bug fix or new feature** → Use **tdd-guide** agent (especially for financial logic)
4. **Architectural decision** → Use **architect** agent

## Parallel Task Execution

ALWAYS use parallel Task execution for independent operations:

```markdown
# GOOD: Parallel execution
Launch 3 agents in parallel:
1. Agent 1: Security analysis of auth module (security-reviewer)
2. Agent 2: Performance review of S2S queries (code-reviewer)
3. Agent 3: Type checking of shared schemas (code-reviewer)

# BAD: Sequential when unnecessary
First agent 1, then agent 2, then agent 3