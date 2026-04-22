---
trigger: always_on
---

Dưới đây là nội dung đã được điều chỉnh cho file `.agent/rules/README.md`, phù hợp với cấu trúc thực tế của dự án S2S Finance (chỉ có TypeScript, loại bỏ các ngôn ngữ không liên quan):

```markdown
# Rules for S2S Finance

## Structure

Rules are organized into a **common** layer plus **language-specific** directories. For this project, only TypeScript rules are needed.

```
rules/
├── common/               # Language-agnostic principles (always installed)
│   ├── coding-style.md
│   ├── git-workflow.md
│   ├── testing.md
│   ├── patterns.md
│   ├── hooks.md
│   ├── agents.md
│   └── security.md
├── typescript/           # TypeScript/JavaScript specific extensions
│   ├── coding-style.md
│   ├── hooks.md
│   ├── patterns.md
│   ├── security.md
│   └── testing.md
├── coding-standards.md   # Project constitution (highest priority)
└── security-context.md   # Core security rules
```

- **common/** contains universal principles — no language-specific code examples.
- **typescript/** extends the common rules with TypeScript/React/Node.js specific patterns and tools.

## Installation

Copy the entire directories to your Claude Code configuration:

```bash
# Install common rules (required)
cp -r .agent/rules/common ~/.claude/rules/common

# Install TypeScript-specific rules
cp -r .agent/rules/typescript ~/.claude/rules/typescript

# Install project constitution files
cp .agent/rules/coding-standards.md ~/.claude/rules/
cp .agent/rules/security-context.md ~/.claude/rules/
```

## Rules vs Skills

- **Rules** define standards, conventions, and checklists that apply broadly (e.g., "80% test coverage", "no hardcoded secrets", "use Decimal.js for money").
- **Skills** (`skills/` directory) provide deep, actionable reference material for specific tasks (e.g., `api-design`, `database-migrations`, `frontend-patterns`).

Language-specific rule files reference relevant skills where appropriate. Rules tell you *what* to do; skills tell you *how* to do it.

## Rule Priority

When language-specific rules and common rules conflict, **language-specific rules take precedence** (specific overrides general). Additionally, `coding-standards.md` and `security-context.md` at the root level override all other rules as the project constitution.

## Customized Rules for S2S Finance

The following files have been tailored specifically for this project:

| File | Customizations |
|------|----------------|
| `common/coding-style.md` | Financial precision rules, Decimal.js usage, TypeScript strictness |
| `common/patterns.md` | Repository pattern with Drizzle, DI container, OCC, idempotency |
| `common/security.md` | HttpOnly cookies, idempotency keys, OCC, audit logging |
| `common/testing.md` | 100% coverage for financial functions, Vitest + Playwright |
| `common/git-workflow.md` | Rebase-based workflow, branch naming with issue IDs |
| `common/agents.md` | Removed Rust reviewer, added financial-specific agent guidance |
| `common/hooks.md` | Simplified to only essential hooks (no tmux, no auto-format) |
| `typescript/*` | Updated with Drizzle, Next.js, and Hono examples |
```
