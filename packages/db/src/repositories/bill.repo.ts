import { eq, and, sql } from "drizzle-orm";
import { bills, billPayments, type Bill, type NewBill, type BillPayment, type NewBillPayment } from "../schema/bills";
import { BaseRepository, type DB } from "./base-repository";

export class BillRepository extends BaseRepository {
  async findAll(userId: string): Promise<Bill[]> {
    return this.db
      .select()
      .from(bills)
      .where(eq(bills.userId, userId));
  }

  async findActive(userId: string): Promise<Bill[]> {
    return this.db
      .select()
      .from(bills)
      .where(and(eq(bills.userId, userId), eq(bills.isActive, true)));
  }

  async findById(id: string, userId: string): Promise<Bill | undefined> {
    const [row] = await this.db
      .select()
      .from(bills)
      .where(and(eq(bills.id, id), eq(bills.userId, userId)))
      .limit(1);
    return row;
  }

  async findByIdempotencyKey(userId: string, key: string): Promise<Bill | undefined> {
    const [row] = await this.db
      .select()
      .from(bills)
      .where(and(eq(bills.userId, userId), eq(bills.idempotencyKey, key)))
      .limit(1);
    return row;
  }

  async create(data: NewBill): Promise<Bill> {
    const [row] = await this.db.insert(bills).values(data).returning();
    if (!row) throw new Error("Failed to create bill");
    return row;
  }

  async update(id: string, userId: string, data: Partial<NewBill>): Promise<Bill> {
    await this.db
      .update(bills)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(bills.id, id), eq(bills.userId, userId)));

    const row = await this.findById(id, userId);
    if (!row) throw new Error("Bill not found after update");
    return row;
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.db
      .delete(bills)
      .where(and(eq(bills.id, id), eq(bills.userId, userId)));
  }

  async findPayments(billId: string, periodMonth: string): Promise<BillPayment[]> {
    return this.db
      .select()
      .from(billPayments)
      .where(and(eq(billPayments.billId, billId), eq(billPayments.periodMonth, periodMonth)));
  }

  async sumPayments(billId: string, periodMonth: string): Promise<string> {
    const rows = await this.db
      .select({ total: sql<string>`sum(${billPayments.amountPaid})` })
      .from(billPayments)
      .where(and(eq(billPayments.billId, billId), eq(billPayments.periodMonth, periodMonth)));
    const row = rows[0];
    return row?.total ?? "0";
  }

  async createPayment(data: NewBillPayment, tx?: DB): Promise<BillPayment> {
    const client = tx || this.db;
    const [row] = await client.insert(billPayments).values(data).returning();
    if (!row) throw new Error("Failed to create bill payment");
    return row;
  }

  async findPaymentByIdempotencyKey(userId: string, key: string, tx?: DB): Promise<BillPayment | undefined> {
    const client = tx || this.db;
    const [row] = await client
      .select()
      .from(billPayments)
      .where(and(eq(billPayments.userId, userId), eq(billPayments.idempotencyKey, key)))
      .limit(1);
    return row;
  }
}
