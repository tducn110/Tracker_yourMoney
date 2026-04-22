# Hooks for S2S Finance

Hooks are event-driven automations that fire before or after Claude Code tool executions. They help maintain code quality without disrupting the development flow.

## Active Hooks

This project uses a minimal set of hooks tailored for the S2S Finance monorepo (Next.js + Hono + TiDB).

### PreToolUse Hooks

| Hook | Matcher | Behavior |
|------|---------|----------|
| **Git push reminder** | `Bash` | Reminds to review changes before `git push` (warns only) |

### PostToolUse Hooks

| Hook | Matcher | What It Does |
|------|---------|-------------|
| **TypeScript check** | `Edit` | Runs `tsc --noEmit` after editing `.ts`/`.tsx` files |
| **console.log warning** | `Edit` | Warns about `console.log` statements in edited files |

### Stop Hooks

| Hook | Event | What It Does |
|------|-------|-------------|
| **Console.log audit** | `Stop` | Checks all modified files for `console.log` after each response |

## Why These Hooks?

- **Git push reminder**: Prevents accidental pushes of incomplete work.
- **TypeScript check**: Catches type errors immediately, critical for financial precision.
- **console.log warnings/audit**: Ensures production code stays clean (no debug logs).

## Disabling Hooks

Use environment variables to control hook behavior without editing `hooks.json`:

```bash
# Disable specific hooks (comma-separated)
export ECC_DISABLED_HOOKS="pre:bash:git-push-reminder,post:edit:typecheck"