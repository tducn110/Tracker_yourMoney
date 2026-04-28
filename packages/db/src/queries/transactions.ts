// packages/db/src/queries/transactions.ts
// Drizzle query builders for transactions — thay thế View v_category_spending_current
import { db } from "../client";
import { transactions, categories } from "../schema";
import { and, eq, desc, sql, type SQL } from "drizzle-orm";

// Get transactions for a user within a date range (used by Budget Engine)
export async function getMonthlyTransactions(
  userId: string,
  month: string, // "YYYY-MM"
) {
  const [year, mon] = month.split("-").map(Number);
  const startDate = `${year}-${String(mon).padStart(2, "0")}-01`;
  const lastDay = new Date(year, mon, 0).getDate();
  const endDate = `${year}-${String(mon).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  return db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        sql`${transactions.displayDate} >= ${startDate}`,
        sql`${transactions.displayDate} <= ${endDate}`,
      ),
    )
    .orderBy(desc(transactions.displayDate));
}

// Get transactions with pagination for list view
export async function getTransactionsPaginated(
  userId: string,
  opts: {
    month?: string;
    categoryId?: number;
    type?: "income" | "expense" | "transfer";
    page?: number;
    limit?: number;
  } = {},
) {
  const { month, categoryId, type, page = 1, limit = 20 } = opts;
  const offset = (page - 1) * limit;

  const filters: SQL[] = [
    eq(transactions.userId, userId),
  ];

  if (month) {
    const [year, mon] = month.split("-").map(Number);
    const startDate = `${year}-${String(mon).padStart(2, "0")}-01`;
    const lastDay = new Date(year, mon, 0).getDate();
    const endDate = `${year}-${String(mon).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    filters.push(sql`${transactions.displayDate} >= ${startDate}`);
    filters.push(sql`${transactions.displayDate} <= ${endDate}`);
  }

  if (categoryId) filters.push(eq(transactions.categoryId, categoryId));
  if (type) filters.push(eq(transactions.type, type));

  // Use Relational Query API for clean, type-safe nested objects
  const results = await db.query.transactions.findMany({
    where: and(...filters),
    with: {
      category: true,
    },
    orderBy: [desc(transactions.displayDate)],
    limit: limit,
    offset: offset,
  });

  return { transactions: results };
}
