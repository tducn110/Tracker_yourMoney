import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { join } from 'path';
import 'dotenv/config';

async function migrate() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL not found');
    return;
  }

  const connection = await mysql.createConnection(url);
  console.log('Connected to database');

  const sqlPath = join(process.cwd(), 'packages/db/drizzle/migrations/0006_crazy_night_thrasher.sql');
  const sql = readFileSync(sqlPath, 'utf8');
  const statements = sql.split('--> statement-breakpoint');

  for (const statement of statements) {
    if (statement.trim()) {
      console.log('Executing:', statement.trim());
      try {
        await connection.execute(statement.trim());
      } catch (e: any) {
        if (e.code === 'ER_DUP_FIELDNAME' || e.code === 'ER_DUP_KEYNAME') {
          console.log('Already exists, skipping...');
        } else {
          throw e;
        }
      }
    }
  }

  await connection.end();
  console.log('Migration completed');
}

migrate().catch(console.error);
