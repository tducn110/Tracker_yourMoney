import { db, users } from '../index';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env'), override: true });

async function test() {
  console.log('Testing DB Write...');
  const testEmail = 'test-' + Date.now() + '@example.com';
  
  try {
    console.log('Inserting user...');
    await db.insert(users).values({
      email: testEmail,
      username: 'testuser' + Date.now(),
      fullName: 'Test User',
      emailVerified: true
    });
    console.log('✅ User inserted.');

    console.log('Fetching user...');
    const user = await db.select().from(users).where(eq(users.email, testEmail)).then(rows => rows[0]);
    if (user) {
      console.log('✅ User fetched:', user.id);
    } else {
      throw new Error('User not found after insert');
    }

    console.log('Cleaning up...');
    await db.delete(users).where(eq(users.email, testEmail));
    console.log('✅ User deleted.');
    
    console.log('--- ALL DB TESTS PASSED ---');
  } catch (error) {
    console.error('❌ DB Test Failed:', error);
    process.exit(1);
  }
}

test();
