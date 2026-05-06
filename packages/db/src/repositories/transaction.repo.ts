import { and, eq, sql } from "drizzle-orm";
import { transactions, type Transaction, type NewTransaction } from "../schema/transactions";
import { BaseRepository, type DB } from "./base-repository";

/**
 * Repository for Transaction operations.
 * Centralizes data access for financial ledger entries.
 */
export class TransactionRepository extends BaseRepository {
  /**
   * Create a new transaction.
   * Supports cross-instance idempotency via the idempotencyKey constraint in DB.
   */
  async create(data: NewTransaction, tx?: DB) {
    const client = tx || this.db;
    const [newTx] = await client.insert(transactions).values(data).returning();
    return newTx || null;
  }

  /**
   * Find a transaction by ID and userId.
   */
  async findById(id: string, userId: string, tx?: DB) {
    const client = tx || this.db;
    const [record] = await client
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.id, id),
          eq(transactions.userId, userId)
        )
      )
      .limit(1);

    return record || null;
  }

  /**
   * Find a transaction by idempotencyKey.
   */
  async findByIdempotencyKey(key: string, userId: string, tx?: DB) {
    const client = tx || this.db;
    const [record] = await client
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.idempotencyKey, key),
          eq(transactions.userId, userId)
        )
      )
      .limit(1);

    return record || null;
  }

  /**
   * Find all transactions for a user, including category details.
   * Migrated to Relational Query API for type safety and clean nested data.
   */
  async findAll(userId: string, tx?: DB) {
    const client = tx || this.db;

    return client.query.transactions.findMany({
      where: eq(transactions.userId, userId),
      with: {
        category: {
          columns: {
            name: true,
            icon: true
          }
        }
      },
      orderBy: (transactions, { desc }) => [desc(transactions.displayDate)]
    });
  }

  /**
   * Find transactions within a date range (Inclusive).
   * Crucial for Budget calculations and reports.
   */
  async findByDateRange(userId: string, startDate: string, endDate: string, tx?: DB) {
    const client = tx || this.db;
    return client
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          sql`${transactions.displayDate} >= ${startDate}`,
          sql`${transactions.displayDate} <= ${endDate}`,
        )
      )
      .orderBy(transactions.displayDate);
  }

  /**
   * Update a transaction.
   */
  async update(id: string, userId: string, data: Partial<NewTransaction>, tx?: DB) {
    const client = tx || this.db;
    const [record] = await client
      .update(transactions)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(transactions.id, id),
          eq(transactions.userId, userId)
        )
      )
      .returning();

    return record || null;
  }
}
