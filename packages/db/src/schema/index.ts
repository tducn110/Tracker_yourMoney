// packages/db/src/schema/index.ts
// Re-export all schemas — single import point for apps/api and queries

// v13.0 — Multi-wallet architecture
export * from "./users";
export * from "./auth";         // user_settings, refresh_tokens
export * from "./categories";
export * from "./wallet";       // wallets, wallet_logs
export * from "./transactions";
export * from "./bills";        // bills, bill_payments
export * from "./goals";
export * from "./budgets";
export * from "./extensions";   // notifications, audit_logs
