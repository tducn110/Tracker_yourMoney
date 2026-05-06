
import { drizzle } from 'drizzle-orm/node-postgres';
import { pgTable, bigint } from 'drizzle-orm/pg-core';
import pg from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function checkTables() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log('Tables in public schema:');
  res.rows.forEach(row => console.log(`- ${row.table_name}`));

  try {
    const billsRes = await client.query('SELECT count(*) FROM "bills"');
    console.log(`- Successfully queried "bills" table. Count: ${billsRes.rows[0].count}`);

    const fullQuery = `select "id", "user_id", "category_id", "name", "icon", "amount", "due_day", "frequency", "auto_pay", "is_active", "notes", "created_at", "updated_at", "idempotency_key" from "bills" where "bills"."is_active" = $1`;
    try {
      const qRes = await client.query(fullQuery, [true]);
      console.log(`- Successfully executed full query. Rows returned: ${qRes.rows.length}`);
    } catch (e) {
      console.error(`- Failed full query: ${(e as Error).message}`);
    }
  } catch (e) {
    console.error(`- Failed to query "bills" table: ${(e as Error).message}`);
  }
  
  // Check drizzle_migrations
  try {
    const migs = await client.query('SELECT * FROM "__drizzle_migrations"');
    console.log('Migrations in DB:', migs.rows);
  } catch (e: any) {
    console.log('__drizzle_migrations table not found in public:', e.message);
    try {
      const migs = await client.query('SELECT * FROM "drizzle"."migrations"');
      console.log('Migrations in drizzle schema:', migs.rows);
    } catch (e2: any) {
      console.log('drizzle.migrations not found either:', e2.message);
    }
  }

  await client.end();
}

checkTables().catch(console.error);
