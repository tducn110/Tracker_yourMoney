/**
 * Firebase initialisation — lazy-loaded to avoid blocking the main thread
 * during initial page load.
 *
 * Before (static import):  firebase/* modules were bundled into the
 * initial chunk and parsed eagerly (~112 KB).
 *
 * After (dynamic import): the SDK is code-split into a separate chunk
 * that only loads when `getFirebaseApp()` or `getFirebaseAuth()` is
 * first called (i.e. when AuthProvider mounts).
 */

import type { FirebaseApp } from "firebase/app";
import type { Auth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// ── Module-level cache ───────────────────────────────────────────────
let _fbApp: FirebaseApp | null = null;
let _fbAuth: Auth | null = null;
let _googleProvider: GoogleAuthProvider | null = null;

// Preload promise — kicked off at module evaluation so by the time
// AuthProvider calls `auth.currentUser` the SDK is already loaded.
let _preloadPromise: Promise<void> | null = null;

function preload(): Promise<void> {
  if (_preloadPromise) return _preloadPromise;
  _preloadPromise = (async () => {
    if (typeof window === "undefined") return;
    const [appModule, authModule] = await Promise.all([
      import("firebase/app"),
      import("firebase/auth"),
    ]);
    _fbApp =
      appModule.getApps().length > 0
        ? appModule.getApp()
        : appModule.initializeApp(firebaseConfig);
    _fbAuth = authModule.getAuth(_fbApp);
    _googleProvider = new authModule.GoogleAuthProvider();
  })();
  return _preloadPromise;
}

// Kick off preload immediately (fire-and-forget)
preload();

// ── Public API ───────────────────────────────────────────────────────

function getFirebaseApp(): FirebaseApp {
  if (!_fbApp) {
    if (typeof window === "undefined") {
      throw new Error("Firebase must only be initialized in a browser context");
    }
    throw new Error(
      "Firebase SDK not loaded yet — AuthProvider should call preload() before accessing auth",
    );
  }
  return _fbApp;
}

function getFirebaseAuth(): Auth {
  if (!_fbAuth) {
    if (typeof window === "undefined") {
      throw new Error("Firebase must only be initialized in a browser context");
    }
    throw new Error(
      "Firebase SDK not loaded yet — AuthProvider should call preload() before accessing auth",
    );
  }
  return _fbAuth;
}

function getGoogleProvider(): GoogleAuthProvider {
  if (!_googleProvider) {
    throw new Error(
      "Firebase SDK not loaded yet — AuthProvider should call preload() before accessing auth",
    );
  }
  return _googleProvider;
}

// ── Proxies (backward-compatible) ────────────────────────────────────
const auth = new Proxy({} as Auth, {
  get(_target, prop) {
    return Reflect.get(getFirebaseAuth(), prop);
  },
});

const googleProvider = new Proxy({} as GoogleAuthProvider, {
  get(_target, prop) {
    return Reflect.get(getGoogleProvider(), prop);
  },
});

export { auth, googleProvider };
