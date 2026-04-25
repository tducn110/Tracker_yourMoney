import { eq, and, isNull, sql } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "../schema/index";
import { bills, billPayments, type Bill, type NewBill, type BillPayment, type NewBillPayment } from "../schema/bills";
import { BaseRepository, type DB } from "./base-repository";

export class BillRepository extends BaseRepository {
  private get typedDb() {
    return this.db as unknown as MySql2Database<typeof schema>;
  }

  async findAll(userId: string): Promise<Bill[]> {
    return this.typedDb
      .select()
      .from(bills)
      .where(and(eq(bills.userId, userId), isNull(bills.deletedAt)));
  }

  async findActive(userId: string): Promise<Bill[]> {
    return this.typedDb
      .select()
      .from(bills)
      .where(and(eq(bills.userId, userId), eq(bills.isActive, 1), isNull(bills.deletedAt)));
  }

  async findById(id: string, userId: string): Promise<Bill | undefined> {
    const [row] = await this.typedDb
      .select()
      .from(bills)
      .where(and(eq(bills.id, id), eq(bills.userId, userId), isNull(bills.deletedAt)))
      .limit(1);
    return row;
  }

  async findByIdempotencyKey(userId: string, key: string): Promise<Bill | undefined> {
    const [row] = await this.typedDb
      .select()
      .from(bills)
      .where(and(eq(bills.userId, userId), eq(bills.idempotencyKey, key), isNull(bills.deletedAt)))
      .limit(1);
    return row;
  }

  async create(data: NewBill): Promise<Bill> {
    const [result] = await this.typedDb.insert(bills).values(data);
    const insertId = String(result.insertId);
    const [row] = await this.typedDb.select().from(bills).where(eq(bills.id, String(insertId))).limit(1);
    if (!row) throw new Error("Failed to create bill");
    return row;
  }

  async update(id: string, userId: string, data: Partial<NewBill>): Promise<Bill> {
    await this.typedDb
      .update(bills)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(bills.id, id), eq(bills.userId, userId)));
    
    const row = await this.findById(id, userId);
    if (!row) throw new Error("Bill not found after update");
    return row;
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.typedDb
      .update(bills)
      .set({ deletedAt: new Date() })
      .where(and(eq(bills.id, id), eq(bills.userId, userId)));
  }

  // Payment related
  async findPayments(billId: string, periodMonth: string): Promise<BillPayment[]> {
    return this.typedDb
      .select()
      .from(billPayments)
      .where(and(eq(billPayments.billId, billId), eq(billPayments.periodMonth, periodMonth)));
  }

  async sumPayments(billId: string, periodMonth: string): Promise<string> {
    const rows = await this.typedDb
      .select({ total: sql<string>`sum(${billPayments.amountPaid})` })
      .from(billPayments)
      .where(and(eq(billPayments.billId, billId), eq(billPayments.periodMonth, periodMonth)));
    const row = rows[0];
    return row?.total ?? "0";
  }

  async createPayment(data: NewBillPayment): Promise<BillPayment> {
    const [result] = await this.typedDb.insert(billPayments).values(data);
    const insertId = String(result.insertId);
    const [row] = await this.typedDb
      .select()
      .from(billPayments)
      .where(eq(billPayments.id, String(insertId)))
      .limit(1);
    if (!row) throw new Error("Failed to create bill payment");
    return row;
  }

  async findPaymentByIdempotencyKey(userId: string, key: string): Promise<BillPayment | undefined> {
    const [row] = await this.typedDb
      .select()
      .from(billPayments)
      .where(and(eq(billPayments.userId, userId), eq(billPayments.idempotencyKey, key)))
      .limit(1);
    return row;
  }
}
