/**
 * Firebase initialisation.
 *
 * Firebase is only required for social login (Google, etc.).
 * Email/password auth talks directly to the Hono API and does NOT need Firebase.
 *
 * When NEXT_PUBLIC_FIREBASE_API_KEY is absent or a placeholder, Firebase
 * initialization is skipped entirely — the app boots cleanly and only
 * Google login will be unavailable.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
  type Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * Returns true when the Firebase config looks real enough to initialize.
 * An empty string, "undefined", or the .env.example placeholder value all
 * count as "not configured".
 */
function isFirebaseConfigured(): boolean {
  const key = firebaseConfig.apiKey;
  return (
    typeof key === "string" &&
    key.length > 0 &&
    key !== "undefined" &&
    !key.startsWith("your-")
  );
}

// Lazy-initialize Firebase only on the client side.
// Running initializeApp at module level causes Turbopack SSR errors
// ("module factory not available") because Firebase uses browser-only APIs.
function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase must only be initialized in a browser context");
  }
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* environment variables to enable Google login."
    );
  }
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

let _auth: Auth | null = null;
let _persistenceReady: Promise<void> | null = null;

function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
    // localStorage survives cross-origin redirects on mobile (Safari / Chrome);
    // sessionStorage is often cleared, causing "missing initial state".
    _persistenceReady = setPersistence(_auth, browserLocalPersistence).catch((err) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Failed to set auth persistence:", err);
      }
      // Resolve anyway — app can limp on with default persistence.
    });
  }
  return _auth;
}

/**
 * Returns a promise that resolves once Firebase Auth persistence is
 * configured.  Callers MUST await this before any sign-in operation;
 * otherwise Firebase uses its default (IndexedDB), which Safari's ITP
 * and Private Mode may block, causing in-memory-only auth state that
 * evaporates on navigation.
 *
 * When Firebase is not configured this resolves immediately — email/password
 * auth does not depend on Firebase at all.
 */
export function whenPersistenceReady(): Promise<void> {
  if (!isFirebaseConfigured()) {
    return Promise.resolve();
  }
  // Touch auth so _persistenceReady is initialised
  try {
    getFirebaseAuth();
  } catch {
    return Promise.resolve();
  }
  return _persistenceReady ?? Promise.resolve();
}

/** Whether Google (Firebase) login is available in this environment. */
export function isFirebaseAvailable(): boolean {
  return isFirebaseConfigured();
}

// Providers are stateless and safe to create eagerly
const googleProvider = new GoogleAuthProvider();

// Lazy proxy for auth — evaluated only when called in the browser.
// If Firebase is not configured, accessing the proxy throws a clear
// "not configured" error rather than the cryptic SDK "invalid-api-key".
const auth = new Proxy({} as Auth, {
  get(_target, prop) {
    return Reflect.get(getFirebaseAuth(), prop);
  },
});

export { auth, googleProvider };
