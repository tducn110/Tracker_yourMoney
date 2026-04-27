# 📂 Git Repository Structure & Framework

This document outlines the framework and monorepo structure for the Finance Tracker project.

## 🏗️ Monorepo Architecture

The project uses a monorepo structure managed by **Turborepo** and **pnpm workspaces**.

```text
.
├── apps/
│   ├── api/                # Hono.js Backend (Vercel Edge Functions)
│   ├── web/                # Next.js 16 Frontend (App Router)
│   └── worker/             # Background workers (Planned)
├── packages/
│   ├── db/                 # Drizzle ORM schema and repositories
│   ├── shared-schemas/     # Zod validation schemas shared by API & Web
│   ├── api-client/         # Typed API client for the frontend
│   └── cache/              # Caching abstraction layer
├── doc/                    # Project documentation
│   ├── wiki/               # Architectural and system docs
│   ├── deploy-git/         # Deployment and Git initialization plans
│   └── check-list/         # Implementation checklists
├── .agent/                 # Antigravity AI agent configuration
├── turbo.json              # Turborepo configuration
└── pnpm-workspace.yaml     # pnpm workspace definition
```

## 📜 Key Configuration Files

- **`turbo.json`**: Orchestrates build/test pipelines across packages.
- **`package.json`**: Root-level dependencies and global scripts.
- **`drizzle.config.ts`**: Database migration and connection configuration.
- **`.agent/rules/`**: AI agent orchestration and coding standards.

## 🚀 Repository Initialization Framework

To push this framework to a new GitHub repository:

1. **Clean up local state**:
   ```bash
   pnpm clean
   ```

2. **Commit the core framework**:
   ```bash
   git add .
   git commit -m "chore: initialize monorepo framework structure"
   ```

3. **Link to the new remote**:
   ```bash
   git remote add origin https://github.com/tducn110/finance-for-me.git
   ```

4. **Establish the base branches**:
   ```bash
   git branch -M main
   git push -u origin main
   git checkout -b dev
   git push -u origin dev
   ```

## 🛠️ Framework Rules

- **Branch Protection**: `main` and `dev` should be protected branches.
- **Workflow Enforcement**: All new features MUST start with an issue and use topic branches.
- **Precision First**: No monetary calculations in the frontend; use `Decimal.js` in the shared logic.
