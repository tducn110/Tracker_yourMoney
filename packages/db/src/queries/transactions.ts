// packages/db/src/queries/transactions.ts
// Drizzle query builders for transactions — thay thế View v_category_spending_current
import { db } from "../client";
import { transactions, categories } from "../schema";
import { and, eq, gte, lte, like, desc, sql, type SQL } from "drizzle-orm";

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

// Get transactions with pagination + advanced filtering for list view
export async function getTransactionsPaginated(
  userId: string,
  opts: {
    month?: string;
    categoryId?: number;
    type?: "income" | "expense" | "transfer";
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    amountMin?: string;
    amountMax?: string;
    page?: number;
    limit?: number;
  } = {},
) {
  const { month, categoryId, type, search, dateFrom, dateTo, amountMin, amountMax, page = 1, limit = 20 } = opts;
  const offset = (page - 1) * limit;

  const filters: SQL[] = [
    eq(transactions.userId, userId),
  ];

  // Date range: month takes precedence, otherwise use dateFrom/dateTo
  if (month) {
    const [year, mon] = month.split("-").map(Number);
    const startDate = `${year}-${String(mon).padStart(2, "0")}-01`;
    const lastDay = new Date(year, mon, 0).getDate();
    const endDate = `${year}-${String(mon).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    filters.push(sql`${transactions.displayDate} >= ${startDate}`);
    filters.push(sql`${transactions.displayDate} <= ${endDate}`);
  } else {
    if (dateFrom) filters.push(gte(transactions.displayDate, dateFrom));
    if (dateTo) filters.push(lte(transactions.displayDate, dateTo));
  }

  if (categoryId) filters.push(eq(transactions.categoryId, categoryId));
  if (type) filters.push(eq(transactions.type, type));

  // Text search on note field
  if (search) {
    filters.push(like(transactions.note, `%${search}%`));
  }

  // Amount range filter
  if (amountMin) filters.push(gte(transactions.amount, amountMin));
  if (amountMax) filters.push(lte(transactions.amount, amountMax));

  // Count total matching
  const [countRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(transactions)
    .where(and(...filters));
  const total = Number(countRow?.total ?? 0);

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

  return { transactions: results, total, pages: Math.ceil(total / limit) };
}
