"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut, 
  AuthProvider as FirebaseAuthProvider
} from "firebase/auth";
import { auth, googleProvider, whenPersistenceReady, isFirebaseAvailable } from "../../_lib/firebase";
import { initiateGoogleOAuth, consumeGoogleOAuthState } from "../../_lib/google-oauth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  fullName?: string;
  username?: string;
  avatarUrl?: string;
  hasOnboarded?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, fullName: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  markOnboarded: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const socialLoginInProgress = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;

    (async () => {
      // 0. Wait for Firebase persistence to be configured before any auth
      //    operation.  Without this, Firebase uses its default (IndexedDB)
      //    which Safari ITP / Private Mode may block → in-memory auth state
      //    evaporates on navigation → user appears signed out.
      await whenPersistenceReady();
      if (cancelled) return;

      if (isFirebaseAvailable()) {
        // 1. Process custom Google OAuth redirect (Safari-compatible — bypasses
        //    Firebase's signInWithRedirect which relies on sessionStorage).
        try {
          const oauthResult = consumeGoogleOAuthState();
          if (oauthResult && !cancelled) {
            socialLoginInProgress.current = true;
            setLoading(true);

            try {
              const credential = GoogleAuthProvider.credential(oauthResult.idToken);
              const credResult = await signInWithCredential(auth, credential);
              const idToken = await credResult.user.getIdToken();

              const response = await fetch("/api/auth/social", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
                credentials: "include",
              });

              if (!response.ok) {
                let errorMessage = "Xác thực backend thất bại (" + response.status + ")";
                const contentType = response.headers.get("content-type");

                if (contentType && contentType.includes("application/json")) {
                  const errorData = await response.json();
                  errorMessage = errorData?.error?.message || errorMessage;
                  const internalMessage = errorData?.error?.details?.internalMessage;
                  if (internalMessage && process.env.NODE_ENV !== "production") {
                    console.error("[Auth] OAuth backend error details:", internalMessage);
                  }
                }

                throw new Error(errorMessage);
              }

              if (!cancelled) {
                const data = await response.json();
                setUser(data.data.user);
                toast.success("Đăng nhập thành công");
                router.push(data.data.user.hasOnboarded ? "/dashboard" : "/onboarding");
              }
            } catch (error) {
              if (process.env.NODE_ENV !== "production") console.error("OAuth login error:", error);
              toast.error(error instanceof Error ? error.message : "Đăng nhập thất bại");
            } finally {
              setTimeout(() => { socialLoginInProgress.current = false; }, 1000);
              if (!cancelled) setLoading(false);
            }
            // Fall through to subscribe onAuthStateChanged
          }
        } catch {
          // No pending OAuth redirect — continue below
        }

        // 2. Process Firebase redirect result (legacy mobile fallback).
        //    Must run before onAuthStateChanged to avoid race.
        try {
          const result = await getRedirectResult(auth);
          if (result && !cancelled) {
            socialLoginInProgress.current = true;
            setLoading(true);

            try {
              const idToken = await result.user.getIdToken();
              const response = await fetch("/api/auth/social", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
                credentials: "include",
              });

              if (response.ok && !cancelled) {
                const data = await response.json();
                setUser(data.data.user);
                toast.success("Đăng nhập thành công");
                router.push(data.data.user.hasOnboarded ? "/dashboard" : "/onboarding");
              }
            } catch (error) {
              if (process.env.NODE_ENV !== "production") console.error("Redirect login error:", error);
              toast.error("Đăng nhập thất bại");
            } finally {
              // Keep guard active briefly to prevent onAuthStateChanged race
              setTimeout(() => { socialLoginInProgress.current = false; }, 1000);
              if (!cancelled) setLoading(false);
            }
            // Fall through to subscribe onAuthStateChanged below; the
            // socialLoginInProgress guard prevents a duplicate /auth/me call.
          }
        } catch {
          // No pending redirect — normal page load, continue below
        }

        if (cancelled) return;

        // 3. Auth state listener (normal page loads & popup flows)
        unsub = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            // Skip /auth/me check if social login is about to set the user from /auth/social response
            if (socialLoginInProgress.current) {
              // Small delay to ensure any concurrent state updates settle
              setTimeout(() => setLoading(false), 500);
              return;
            }
            try {
              const response = await fetch("/api/auth/me", {
                credentials: "include",
              });
              if (response.ok) {
                const data = await response.json();
                setUser(data.data);
              } else if (response.status === 401) {
                // Backend session expired — try refreshing via Firebase idToken
                try {
                  const currentUser = auth.currentUser;
                  if (currentUser) {
                    const idToken = await currentUser.getIdToken();
                    const refreshRes = await fetch("/api/auth/social", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ idToken }),
                      credentials: "include",
                    });
                    if (refreshRes.ok) {
                      const data = await refreshRes.json();
                      setUser(data.data.user);
                      return;
                    }
                  }
                } catch {
                  // Refresh failed — fall through to setUser(null)
                }
                setUser(null);
              } else {
                // Token expired or invalid at backend
                let errorMsg = "";
                try {
                  const errorData = await response.json();
                  errorMsg = errorData.error?.message || "";
                } catch {
                  // fallback to status text
                }
                if (process.env.NODE_ENV !== 'production') {
                  console.error(
                    `Auth /me failed: HTTP ${response.status} ${response.statusText} ${errorMsg ? `— ${errorMsg}` : ""}`,
                  );
                }
                setUser(null);
              }
            } catch (error) {
              if (process.env.NODE_ENV !== 'production') console.error("Sync user error:", error);
              setUser(null);
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      } else {
        // Firebase not configured — skip all Firebase auth.
        // Check for an existing backend session (email/password login persists
        // via httpOnly cookie; this restores the user on page refresh).
        if (!cancelled) {
          try {
            const response = await fetch("/api/auth/me", { credentials: "include" });
            if (response.ok) {
              const data = await response.json();
              if (!cancelled) setUser(data.data);
            }
          } catch {
            // No active session — stay logged out
          }
          if (!cancelled) setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  const loginWithSocial = async (provider: FirebaseAuthProvider) => {
    socialLoginInProgress.current = true;
    try {
      setLoading(true);

      let result;
      try {
        result = await signInWithPopup(auth, provider);
      } catch (popupError: any) {
        // On mobile (iOS Safari / Android Chrome), popups are often blocked.
        // Fall back to redirect — the useEffect above catches the result on return.
        if (
          popupError.code === "auth/popup-blocked" ||
          popupError.code === "auth/popup-closed-by-user" ||
          popupError.code === "auth/cancelled-popup-request" ||
          popupError.code === "auth/operation-not-supported-in-this-environment"
        ) {
          // Use custom OAuth redirect that stores state in localStorage
          // instead of sessionStorage (Safari clears sessionStorage during
          // cross-origin redirects, causing "missing initial state").
          initiateGoogleOAuth();
          // Browser will redirect away — execution stops here.
          return;
        }
        throw popupError; // Re-throw unexpected errors
      }

      const idToken = await result.user.getIdToken();

      const response = await fetch("/api/auth/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        credentials: "include",
      });

      if (!response.ok) {
        let errorData: any;
        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json();
        } else {
          const text = await response.text();
          if (process.env.NODE_ENV !== 'production') console.error("Non-JSON error response:", text);
          errorData = { error: { message: `Server error (${response.status}): ${text.substring(0, 100)}` } };
        }
        
        const errorMessage = errorData?.error?.message || `Lỗi kết nối backend (${response.status})`;
        const internalMessage = errorData?.error?.details?.internalMessage;
        if (internalMessage) {
          if (process.env.NODE_ENV !== 'production') console.error("[Auth] Backend error details:", internalMessage);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setUser(data.data.user);
      toast.success("Đăng nhập thành công");
      router.push(data.data.user.hasOnboarded ? "/dashboard" : "/onboarding");
    } catch (error: any) {
      if (process.env.NODE_ENV !== 'production') console.error("Social login error:", error);
      toast.error(error.message || "Đăng nhập thất bại");
    } finally {
      // Keep guard active for a short bit to prevent race with Auth observer
      setTimeout(() => {
        socialLoginInProgress.current = false;
      }, 1000);
      setLoading(false);
    }
  };

  const loginWithGoogle = () => loginWithSocial(googleProvider);

  /** Email/password login against the Hono API */
  const loginWithEmail = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || "Đăng nhập thất bại");
    }

    setUser(data.data.user);
    toast.success("Đăng nhập thành công");
    router.push(data.data.user.hasOnboarded ? "/dashboard" : "/onboarding");
  };

  /** Email/password register against the Hono API */
  const registerWithEmail = async (
    email: string,
    password: string,
    fullName: string,
    username: string,
  ) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName, username }),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || "Đăng ký thất bại");
    }

    setUser(data.data.user);
    toast.success("Tạo tài khoản thành công! Chào mừng bạn 🎉");
    router.push(data.data.user.hasOnboarded ? "/dashboard" : "/onboarding");
  };

  const logout = async () => {
    try {
      if (isFirebaseAvailable()) {
        await firebaseSignOut(auth);
      }
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      setUser(null);
      router.push("/login");
      toast.success("Đã đăng xuất");
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') console.error("Logout error:", error);
      toast.error("Lỗi khi đăng xuất");
    }
  };

  const markOnboarded = () => {
    setUser((currentUser) => currentUser ? { ...currentUser, hasOnboarded: true } : currentUser);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
      logout,
      markOnboarded,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
