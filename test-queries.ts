import { db } from "@finance/db";
import { getTransactionsPaginated } from "./packages/db/src/queries/transactions";
import { users } from "@finance/db/src/schema/users";

async function run() {
  const allUsers = await db.select().from(users).limit(1);
  if (allUsers.length === 0) {
    console.log("No users found");
    process.exit(1);
  }
  const userId = String(allUsers[0].id);
  console.log(`Using userId: ${userId}`);

  const res = await getTransactionsPaginated(db, userId, {
    page: 1,
    limit: 10
  });

  console.log(JSON.stringify(res, null, 2));
  process.exit(0);
}

run().catch(console.error);
