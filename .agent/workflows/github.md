---
description: Issue-Driven Feature Development Workflow for S2S Finance
---

# 🚀 Feature Development Workflow (S2S Finance)

Follow these steps for EVERY new feature or bug fix.

## 1. Issue Creation
- **Rule**: No coding without an Issue ID.
- **Command**:
  ```bash
  gh issue create --title "[FEAT] Brief description" --body "Detailed description of the feature or bug."
  ```
- **Alternative**: Create issue manually on GitHub and note the issue number.

## 2. Topic Branching
- **Rule**: Branches must follow the pattern `feature/issue-<ID>-<short-description>` or `fix/issue-<ID>-<short-description>`.
- **Commands**:
  ```bash
  git checkout dev
  git pull origin dev
  git checkout -b feature/issue-42-goals-crud
  ```

## 3. Rebase with Latest `dev`
- **Rule**: Before pushing your branch, rebase it onto the latest `dev` to keep history clean and avoid merge conflicts.
- **Commands**:
  ```bash
  git fetch origin
  git rebase origin/dev
  ```
- Resolve any conflicts locally, then continue with `git rebase --continue`.

## 4. Implementation
- Work on the feature locally, committing small, atomic changes.
- Follow `.agent/rules/coding-standards.md` and run `pnpm typecheck` / `pnpm lint` regularly.

## 5. Verification with GitNexus
- **Rule**: Run impact detection before pushing.
- **Command**:
  ```bash
  mcp_gitnexus_detect_changes()
  ```
- Review the affected processes and risk summary. If unexpected areas are hit, refactor or document the reason.

## 6. Push and Create Pull Request
- **Rule**: Never push directly to `dev` or `main`.
- **Commands**:
  ```bash
  git push -u origin feature/issue-42-goals-crud
  gh pr create --base dev --head feature/issue-42-goals-crud
  ```
- **PR Title**: Use format `[FEAT] Brief description (#42)`
- **PR Description**: Use the PR template (see `.agent/rules/common/git-workflow.md`).

## 6. Review & Merge
- After PR approval and passing CI checks, **rebase and merge** the PR on GitHub (do **NOT** squash).
- Delete the feature branch both remotely and locally after merge:
  ```bash
  git branch -d feature/issue-42-goals-crud
  ```

## 7. Sync with Upstream
- After merging to `dev`, periodically sync your local `dev` branch:
  ```bash
  git checkout dev
  git pull origin dev
  ```