// apps/api/src/services/bill-service.ts
import Decimal from "decimal.js";
import type { BillRepository } from "@finance/db/src/repositories/bill.repo";
import type { InsertBill, UpdateBill, InsertBillPayment } from "@finance/shared-schemas";

export type BillStatus = "paid" | "partial" | "pending";

export class BillService {
  constructor(private readonly repository: BillRepository) {}

  async getBillPaymentStatus(userId: string, billId: string, periodMonth: string): Promise<{ status: BillStatus; totalPaid: string }> {
    const totalPaidStr = await this.repository.sumPayments(billId, periodMonth);
    const totalPaid = new Decimal(totalPaidStr);
    
    const bill = await this.repository.findById(billId, userId);
    if (!bill) throw Object.assign(new Error("Hóa đơn không tồn tại"), { code: "NOT_FOUND" });
    
    const billAmount = new Decimal(bill.amount);

    const status: BillStatus =
      totalPaid.gte(billAmount) ? "paid" :
      totalPaid.gt(0)           ? "partial" : "pending";

    return { status, totalPaid: totalPaid.toFixed(2) };
  }

  async payBill(userId: string, input: InsertBillPayment & { idempotencyKey?: string }) {
    const billIdNum = input.billId;
    const bill = await this.repository.findById(billIdNum, userId);

    if (!bill) throw Object.assign(new Error("Hóa đơn không tồn tại"), { code: "NOT_FOUND" });

    const { status } = await this.getBillPaymentStatus(userId, billIdNum, input.periodMonth);
    if (status === "paid") {
      throw Object.assign(new Error("Hóa đơn kỳ này đã thanh toán đủ"), { code: "ALREADY_PAID" });
    }

    return this.repository.createPayment({
      billId:      billIdNum as any,
      userId:      userId as any,
      periodMonth: input.periodMonth,
      amountPaid:  input.amountPaid,
      note:        input.note ?? null,
      idempotencyKey: input.idempotencyKey,
    });
  }

  async getBillByIdempotencyKey(userId: string, key: string) {
    return this.repository.findByIdempotencyKey(userId, key);
  }

  async getPaymentByIdempotencyKey(userId: string, key: string) {
    return this.repository.findPaymentByIdempotencyKey(userId, key);
  }

  async getActiveBills(userId: string) {
    return this.repository.findActive(userId);
  }

  async getAllBills(userId: string) {
    return this.repository.findAll(userId);
  }

  async createBill(userId: string, input: InsertBill & { idempotencyKey?: string }) {
    return this.repository.create({
      ...input,
      userId: userId as any,
      idempotencyKey: input.idempotencyKey,
    });
  }

  async updateBill(userId: string, id: string, input: UpdateBill) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) throw Object.assign(new Error("Hóa đơn không tồn tại"), { code: "NOT_FOUND" });

    return this.repository.update(id, userId, {
      ...input,
    });
  }

  async deleteBill(userId: string, id: string) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) throw Object.assign(new Error("Hóa đơn không tồn tại"), { code: "NOT_FOUND" });
    
    await this.repository.delete(id, userId);
  }
}

