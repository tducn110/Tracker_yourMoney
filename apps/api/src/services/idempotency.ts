// apps/api/src/services/idempotency.ts
import { db, transactions, bills, goals, eq, and } from "@finance/db";

/**
 * Service này hỗ trợ kiểm tra tính idempotent (không trùng lặp) 
 * cho các giao dịch tài chính quan trọng.
 */
export class IdempotencyService {
  /**
   * Kiểm tra xem một key đã tồn tại trong bảng transactions chưa
   */
  async findTransactionByKey(userId: string, key: string) {
    return await db.query.transactions.findFirst({
      where: and(
        eq(transactions.userId, userId),
        eq(transactions.idempotencyKey, key)
      ),
    });
  }

  /**
   * Kiểm tra xem một key đã tồn tại trong bảng bills chưa
   */
  async findBillByKey(userId: string, key: string) {
    return await db.query.bills.findFirst({
      where: and(
        eq(bills.userId, userId),
        eq(bills.idempotencyKey, key)
      ),
    });
  }

  /**
   * Kiểm tra xem một key đã tồn tại trong bảng goals chưa
   */
  async findGoalByKey(userId: string, key: string) {
    return await db.query.goals.findFirst({
      where: and(
        eq(goals.userId, userId),
        eq(goals.idempotencyKey, key)
      ),
    });
  }
}

export const idempotencyService = new IdempotencyService();
