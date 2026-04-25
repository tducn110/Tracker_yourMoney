// packages/db/src/schema/index.ts
// Re-export all schemas — single import point for apps/api and queries

// Phase 1 — MVP Core
export * from "./users";
export * from "./auth";         // user_settings, refresh_tokens
export * from "./categories";
export * from "./transactions";
export * from "./bills";        // bills, bill_payments
export * from "./goals";
export * from "./wallet";       // cash_wallet, cash_wallet_logs

// Phase 2 — Extended (schema available, activate when needed)
export * from "./extensions";   // notifications, audit_logs
export * from "./budgets";
