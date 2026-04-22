---
trigger: always_on
---

# Git Workflow (S2S Finance)

## Branching Strategy

| Branch | Purpose | Source |
|--------|---------|--------|
| `main` | Production-ready code | - |
| `dev` | Integration branch for ongoing development | `main` |
| `feature/*` | New features or enhancements | `dev` |
| `fix/*` | Bug fixes | `dev` |
| `hotfix/*` | Critical production fixes | `main` |

### Branch Naming Convention

```
feature/issue-<ID>-<short-description>
fix/issue-<ID>-<short-description>
hotfix/<description>
```

**Examples:**
- `feature/issue-42-goals-crud`
- `fix/issue-87-s2s-calculation-precision`

## Commit Message Format

```
<type>(<scope>): <description>

[optional body]
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

**Scope (optional):** Package name (e.g., `api`, `web`, `db`, `shared-schemas`)

**Examples:**
```
feat(api): add idempotency key to transaction creation
fix(web): correct S2S display when over budget
```

## Step-by-Step Workflow

### 1. Create an Issue
- Every change starts with a GitHub Issue.
- Issue title: `[FEAT] Goals CRUD` or `[FIX] S2S precision error`

### 2. Create a Feature Branch from Issue
- From the issue page on GitHub, use **"Create a branch"** (this links the branch to the issue).
- Branch will be created from `dev` automatically.
- Alternatively, create locally and link manually:
  ```bash
  git checkout dev
  git pull origin dev
  git checkout -b feature/issue-42-goals-crud
  ```

### 3. Rebase with Latest `dev` Before Pushing
- Before pushing your branch, ensure it's up-to-date with `dev`:
  ```bash
  git fetch origin
  git rebase origin/dev
  ```
- Resolve any conflicts locally. This keeps your branch clean and avoids merge commits in your feature branch.

### 4. Develop and Test
- Implement the feature following TDD.
- Run checks locally:
  ```bash
  pnpm typecheck
  pnpm lint
  pnpm test
  ```
- Commit changes as you go with meaningful commit messages.

### 5. Push Feature Branch
```bash
git push -u origin feature/issue-42-goals-crud
```
- If you have already pushed and later rebased, you may need to force push:
  ```bash
  git push --force-with-lease
  ```

### 6. Create Pull Request to `dev`
- Open PR from `feature/issue-42-goals-crud` → `dev`.
- Use PR template (see below).
- Request review and address feedback.
- If changes are requested, add new commits and push again.

### 7. Merge to `dev` (Rebase and Merge)
- After approval and passing CI, **rebase and merge** the PR on GitHub.
  - This applies all commits from the feature branch onto the tip of `dev` in a linear fashion.
  - Each commit retains its original authorship and message.
- Alternatively, if using command line:
  ```bash
  git checkout dev
  git pull origin dev
  git merge --no-ff feature/issue-42-goals-crud  # Optional: create merge commit for traceability
  git push origin dev
  ```
- Delete the feature branch after merge.

### 8. Release to Production (`main`)
- When `dev` is stable and ready for release:
  ```bash
  git checkout main
  git pull origin main
  git merge dev --no-ff   # Create a merge commit for release tracking
  git tag -a v1.2.0 -m "Release v1.2.0"
  git push origin main --tags
  ```

## Hotfix Workflow

For urgent production fixes:
1. Create branch from `main`: `hotfix/critical-bug`
2. Fix, test, and push.
3. Create PR to `main` (use rebase and merge).
4. After merge, tag new patch version.
5. Merge `main` back into `dev` (rebase or merge) to keep them in sync.

## PR Template

```markdown
## Summary
Brief description of changes.

## Related Issue
Closes #<issue-number>

## Type of Change
- [ ] feat: new feature
- [ ] fix: bug fix
- [ ] refactor: code improvement
- [ ] docs: documentation
- [ ] test: testing
- [ ] chore: maintenance

## Packages Affected
- [ ] @finance/api
- [ ] @finance/web
- [ ] @finance/db
- [ ] @finance/shared-schemas
- [ ] @finance/cache

## Testing
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
- [ ] Manual testing performed

## Financial Impact (if applicable)
- [ ] Precision verified with Decimal.js
- [ ] Idempotency key implemented
- [ ] OCC (version check) for balance updates

## Checklist
- [ ] Rebased on latest `dev`
- [ ] No `any` or `@ts-ignore`
- [ ] Zod schemas updated in `@finance/shared-schemas`
- [ ] Database migrations generated (if schema changed)
```

---

> For the full development process (research, planning, TDD, code review) before Git operations,
> see [development-workflow.md](./development-workflow.md).
```

