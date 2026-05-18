import { db } from "./src/client";
import { getTransactionsPaginated } from "./src/queries/transactions";
import { transactions } from "./src/schema/transactions";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function run() {
  const userId = "3";
  
  // Create more transactions
  const toInsert = Array.from({length: 15}).map((_, i) => ({
    userId,
    walletId: 1, // Fix: provide walletId
    amount: "100",
    type: "expense" as const,
    categoryId: 1,
    displayDate: "2024-05-01",
    note: `test ${i}`
  }));
  
  await db.insert(transactions).values(toInsert);

  const res50 = await getTransactionsPaginated(userId, { limit: 50 });
  console.log("limit 50 -> count:", res50.total, "Returned length:", res50.transactions.length);

  process.exit(0);
}

run().catch(console.error);
