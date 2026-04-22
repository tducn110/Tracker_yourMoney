---
trigger: always_on
---

# Hooks System (S2S Finance)

## Hook Types

- **PreToolUse**: Before tool execution (validation, parameter modification)
- **PostToolUse**: After tool execution (auto-format, checks)
- **Stop**: When session ends (final verification)

## Active Hooks in This Project

| Hook | Type | Matcher | Behavior |
|------|------|---------|----------|
| Git push reminder | PreToolUse | `Bash` | Reminds to review changes before `git push` |
| TypeScript check | PostToolUse | `Edit` | Runs `tsc --noEmit` after editing `.ts`/`.tsx` files |
| console.log warning | PostToolUse | `Edit\|Write\|MultiEdit` | Warns about `console.log` statements in edited files |
| Console.log audit | Stop | `*` | Checks all modified files for `console.log` after each response |

> **Note:** Tmux-related hooks, auto-format, and continuous learning hooks have been disabled for this project to reduce noise and avoid cross-platform issues.

## Auto-Accept Permissions

Use with caution:
- Enable for trusted, well-defined plans
- Disable for exploratory work
- Never use `dangerously-skip-permissions` flag
- Configure `allowedTools` in `~/.claude/settings.json` instead

## TodoWrite Best Practices

Use TodoWrite tool to:
- Track progress on multi-step tasks
- Verify understanding of instructions
- Enable real-time steering
- Show granular implementation steps

Todo list reveals:
- Out of order steps
- Missing items
- Extra unnecessary items
- Wrong granularity
- Misinterpreted requirements

## Disabling Hooks

Use environment variables to control hook behavior without editing `hooks.json`:

```bash
# Disable specific hooks (comma-separated)
export ECC_DISABLED_HOOKS="pre:bash:git-push-reminder,post:edit:typecheck"