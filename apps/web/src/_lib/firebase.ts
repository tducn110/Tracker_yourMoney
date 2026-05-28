/**
 * Firebase initialisation.
 *
 * Reverted to static imports — the dynamic import + proxy pattern caused
 * a race condition where AuthProvider mounted before the firebase SDK
 * finished loading, crashing Google login.
 *
 * The main bundle-savings came from dynamic imports in layout/page and
 * MUI removal (~650 KB total).  Firebase static import adds ~112 KB but
 * is required for reliable auth initialization.
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

// Lazy-initialize Firebase only on the client side.
// Running initializeApp at module level causes Turbopack SSR errors
// ("module factory not available") because Firebase uses browser-only APIs.
function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase must only be initialized in a browser context");
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
 */
export function whenPersistenceReady(): Promise<void> {
  // Touch auth so _persistenceReady is initialised
  getFirebaseAuth();
  return _persistenceReady ?? Promise.resolve();
}

// Providers are stateless and safe to create eagerly
const googleProvider = new GoogleAuthProvider();

// Lazy proxy for auth — evaluated only when called in the browser
const auth = new Proxy({} as Auth, {
  get(_target, prop) {
    return Reflect.get(getFirebaseAuth(), prop);
  },
});

export { auth, googleProvider };
