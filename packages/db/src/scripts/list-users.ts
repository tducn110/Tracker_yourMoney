import { db, users } from '../index';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env'), override: true });

async function test() {
  const allUsers = await db.select().from(users);
  console.log('All Users:', JSON.stringify(allUsers, null, 2));
}

test();
