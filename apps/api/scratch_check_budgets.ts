import { db } from "../packages/db/src/client";
import { budgets } from "../packages/db/src/schema/budgets";
import { isNull } from "drizzle-orm";

async function main() {
  const allBudgets = await db.select().from(budgets).where(isNull(budgets.deletedAt));
  console.log("Budgets in DB:", JSON.stringify(allBudgets, null, 2));
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
