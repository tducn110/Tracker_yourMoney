// apps/api/src/lib/firebase-auth.ts
import * as admin from "firebase-admin";

// Lazy initialization to ensure dotenv is loaded first
function getAuth() {
  if (!admin.apps.length) {
    const clean = (val: string | undefined) => val?.replace(/["']/g, "").trim() || "";
    
    const projectId = clean(process.env.FIREBASE_PROJECT_ID);
    const clientEmail = clean(process.env.FIREBASE_CLIENT_EMAIL);
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "")
      .trim()
      .replace(/^["']|["']$/g, "")
      .replace(/\\n/g, "\n");

    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: privateKey,
      }),
    });

    console.log(`🔥 Firebase Admin SDK initialized for project: ${app.options.projectId || projectId}`);
  }
  return admin.auth();
}

// Wrappers cho Admin SDK Auth
export async function verifyFirebaseIdToken(idToken: string) {
  return getAuth().verifyIdToken(idToken);
}

export async function createSessionCookie(
  idToken: string,
  expiresInMs: number = 14 * 24 * 60 * 60 * 1000 // 14 days
): Promise<string> {
  return getAuth().createSessionCookie(idToken, { expiresIn: expiresInMs });
}

export async function verifySessionCookie(sessionCookie: string) {
  return getAuth().verifySessionCookie(sessionCookie, true); // checkRevoked = true
}
