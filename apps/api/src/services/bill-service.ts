// apps/api/src/services/bill-service.ts
import Decimal from "decimal.js";
import type { TransactionRepository } from "@finance/db/src/repositories/transaction.repo";
import type { BillRepository } from "@finance/db/src/repositories/bill.repo";
import type { InsertBill, UpdateBill, InsertBillPayment } from "@finance/shared-schemas";
import { db, wallets, walletLogs, transactions, and, eq, sql } from "@finance/db";
import { NotFoundError, ConflictError, BadRequestError } from "../lib/errors";

export type BillStatus = "paid" | "partial" | "pending";

export class BillService {
  constructor(
    private readonly repository: BillRepository,
    private readonly transactionRepository: TransactionRepository
  ) {}

  async getBillPaymentStatus(userId: string, billId: string, periodMonth: string): Promise<{ status: BillStatus; totalPaid: string }> {
    const totalPaidStr = await this.repository.sumPayments(billId, periodMonth);
    const totalPaid = new Decimal(totalPaidStr);
    
    const bill = await this.repository.findById(billId, userId);
    if (!bill) throw new NotFoundError("Hóa đơn không tồn tại");
    
    const billAmount = new Decimal(bill.amount);

    const status: BillStatus =
      totalPaid.gte(billAmount) ? "paid" :
      totalPaid.gt(0)           ? "partial" : "pending";

    return { status, totalPaid: totalPaid.toFixed(2) };
  }

  async payBill(userId: string, input: InsertBillPayment & { idempotencyKey?: string }) {
    const billIdNum = input.billId;
    const bill = await this.repository.findById(billIdNum, userId);

    if (!bill) throw new NotFoundError("Hóa đơn không tồn tại");

    const { status, totalPaid } = await this.getBillPaymentStatus(userId, billIdNum, input.periodMonth);
    if (status === "paid") {
      throw new ConflictError("Hóa đơn kỳ này đã thanh toán đủ", "ALREADY_PAID");
    }

    const billAmount = new Decimal(bill.amount);
    const totalPaidDecimal = new Decimal(totalPaid);
    const remainingBalance = billAmount.minus(totalPaidDecimal);

    if (new Decimal(input.amountPaid).gt(remainingBalance)) {
      throw new BadRequestError(`Số tiền thanh toán (${input.amountPaid}) vượt quá số dư còn lại (${remainingBalance.toFixed(2)})`);
    }

    return await db.transaction(async (tx) => {
      // 1. Create Bill Payment Record
      const payment = await this.repository.createPayment({
        billId:      billIdNum as any,
        userId:      userId as any,
        periodMonth: input.periodMonth,
        amountPaid:  input.amountPaid,
        note:        input.note ?? null,
        idempotencyKey: input.idempotencyKey,
      }, tx);

      // 2. Fetch wallet for balance update + OCC
      const [wallet] = await tx
        .select()
        .from(wallets)
        .where(and(eq(wallets.id, input.walletId as any), eq(wallets.userId, userId as any)))
        .limit(1);

      if (!wallet) throw new NotFoundError("Không tìm thấy ví");

      const amount = new Decimal(input.amountPaid);
      const balanceBefore = new Decimal(wallet.balance);
      const balanceAfter = balanceBefore.minus(amount);

      // 3. Update wallet balance (OCC)
      const updateResult = await tx.update(wallets).set({
        balance: balanceAfter.toFixed(2),
        version: sql`version + 1`,
        updatedAt: new Date(),
      }).where(and(
        eq(wallets.id, input.walletId as any),
        eq(wallets.userId, userId as any),
        eq(wallets.version, wallet.version ?? 0),
      ));

      if ((updateResult as any).rowCount === 0) {
        throw new ConflictError("Xung đột cập nhật ví — vui lòng thử lại");
      }

      // 4. Create Transaction Record (Expense)
      const createdTx = await this.transactionRepository.create({
        userId: userId as any,
        walletId: input.walletId as any,
        categoryId: bill.categoryId,
        amount: input.amountPaid,
        type: "expense",
        note: `Thanh toán hóa đơn: ${bill.name}${input.note ? ` - ${input.note}` : ""}`,
        displayDate: new Date().toISOString().split('T')[0],
        source: "bill_payment",
        idempotencyKey: input.idempotencyKey ?? null,
      }, tx);

      // 5. Audit log
      await tx.insert(walletLogs).values({
        walletId: input.walletId as any,
        userId: userId as any,
        transactionId: createdTx?.id as any ?? null,
        balanceBefore: balanceBefore.toFixed(2),
        balanceAfter: balanceAfter.toFixed(2),
        difference: amount.negated().toFixed(2),
        note: `Thanh toán hóa đơn: ${bill.name}`,
        idempotencyKey: input.idempotencyKey ?? null,
      });

      return payment;
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
    if (!existing) throw new NotFoundError("Hóa đơn không tồn tại");

    return this.repository.update(id, userId, {
      ...input,
    });
  }

  async deleteBill(userId: string, id: string) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) throw new NotFoundError("Hóa đơn không tồn tại");
    
    await this.repository.delete(id, userId);
  }
}

