// packages/db/src/index.ts
// PostgreSQL driver via pg + Drizzle ORM

export * from "./client";
export * from "drizzle-orm";
export * from "./schema/index";
export * from "./queries/summary";
export * from "./queries/transactions";
export type { Transaction, NewTransaction } from "./schema/index";
export type { User, NewUser } from "./schema/index";
export type { Goal, NewGoal } from "./schema/index";
export type { BillPayment, NewBillPayment } from "./schema/index";
export type { Wallet, NewWallet, WalletLog, NewWalletLog } from "./schema/index";
export { traceStorage } from "./telemetry";
export { SYSTEM_CATEGORY_NAMES, SAVINGS_CATEGORY_DEFAULTS } from "./constants/system-categories";
export type { SystemCategoryName } from "./constants/system-categories";
