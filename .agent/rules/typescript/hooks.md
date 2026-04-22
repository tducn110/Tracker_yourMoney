---
trigger: always_on
---

---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---
# TypeScript/JavaScript Hooks (S2S Finance)

> This file extends [common/hooks.md](../common/hooks.md) with TypeScript/JavaScript specific content.

## Active PostToolUse Hooks

The following hooks are configured in `.agent/hooks/hooks.json` and apply to TypeScript/JavaScript files:

| Hook | Matcher | Behavior |
|------|---------|----------|
| **TypeScript check** | `Edit` | Runs `tsc --noEmit` after editing `.ts`/`.tsx` files |
| **console.log warning** | `Edit` | Warns about `console.log` statements in edited files |

## Stop Hooks

| Hook | Matcher | Behavior |
|------|---------|----------|
| **console.log audit** | `*` | Checks all modified files for `console.log` before session ends |

## Disabling Hooks

Use environment variables to control hook behavior:

```bash
# Disable specific hooks
export ECC_DISABLED_HOOKS="post:edit:typecheck,post:edit:console-warn"