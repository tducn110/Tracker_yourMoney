import { SignJWT } from 'jose';

async function main() {
  const secret = new TextEncoder().encode('finance_tracker_default_secret_for_dev');
  const token = await new SignJWT({ userId: '1', email: 'demouser@gmail.com' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);
  console.log(token);
}
main();
