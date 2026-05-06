
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.resolve(__dirname, '../');

dotenv.config({ path: path.join(rootPath, '.env.local'), override: true });

const clean = (val: string | undefined) => val?.replace(/["']/g, "").trim() || "";
    
const projectId = clean(process.env.FIREBASE_PROJECT_ID);
const clientEmail = clean(process.env.FIREBASE_CLIENT_EMAIL);
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "")
  .trim()
  .replace(/^["']|["']$/g, "")
  .replace(/\\n/g, "\n");

console.log('Project ID:', projectId);
console.log('Client Email:', clientEmail);
console.log('Private Key Start:', privateKey.substring(0, 30));
console.log('Private Key End:', privateKey.substring(privateKey.length - 30));

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
  console.log('Firebase Admin initialized successfully in test script');
} catch (e) {
  console.error('Firebase Admin initialization failed:', e);
}
