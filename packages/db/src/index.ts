// packages/db/src/index.ts
// Dual-mode driver: support both standard MySQL TCP (Local/CI) and TiDB HTTP (Edge)
import { connect } from "@tidbcloud/serverless";
import { drizzle as drizzleServerless, TiDBServerlessDatabase } from "drizzle-orm/tidb-serverless";
import { drizzle as drizzleMysql2, MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
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
export type { CashWallet } from "./schema/index";
export { traceStorage } from "./telemetry";
