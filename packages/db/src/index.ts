// packages/db/src/index.ts
// PostgreSQL driver via node-postgres + Drizzle ORM
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/index";

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
