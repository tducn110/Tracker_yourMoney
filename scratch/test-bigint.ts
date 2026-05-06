import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { db, users } from '@finance/db';
import { eq } from '@finance/db';

async function main() {
  try {
    // Test: does string userId work with bigint column?
    const rows = await db.select().from(users).where(eq(users.id, "1" as any)).limit(1);
    console.log('eq(users.id, "1") works:', rows.length, 'rows');

    // Test: does numeric userId work better?
    const rows2 = await db.select().from(users).where(eq(users.id, 1 as any)).limit(1);
    console.log('eq(users.id, 1) works:', rows2.length, 'rows');

    // Test: does BigInt userId work?
    const rows3 = await db.select().from(users).where(eq(users.id, BigInt(1) as any)).limit(1);
    console.log('eq(users.id, BigInt(1)) works:', rows3.length, 'rows');

    console.log('All tests passed');
    process.exit(0);
  } catch (e: any) {
    console.error('TEST FAILED:', e.message);
    process.exit(1);
  }
}
main();
