import { db } from "./client";
import { getTransactionsPaginated } from "./queries/transactions";
import { users } from "./schema/users";
import { transactions } from "./schema/transactions";
import { count } from "drizzle-orm";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function run() {
  const allUsers = await db.select().from(users).limit(1);
  if (allUsers.length === 0) {
    console.log("No users found");
    process.exit(1);
  }
  const userId = String(allUsers[0].id);
  
  const allTxs = await db.select({ c: count() }).from(transactions);
  console.log("Total txs in DB:", allTxs[0].c);

  const res = await getTransactionsPaginated(userId, {
    page: 1,
    limit: 10
  });

  console.log("Count from getTransactionsPaginated:", res.total);
  process.exit(0);
}

run().catch(console.error);
