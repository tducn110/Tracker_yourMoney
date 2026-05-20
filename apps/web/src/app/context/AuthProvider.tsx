"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut, 
  AuthProvider as FirebaseAuthProvider
} from "firebase/auth";
import { auth, googleProvider } from "../../_lib/firebase";
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
      // 1. Process redirect result FIRST (mobile fallback returns here after signInWithRedirect).
      //    Must run before onAuthStateChanged to avoid race between getRedirectResult and
      //    the auth-state listener firing for the same user.
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
          return; // Redirect result processed — skip onAuthStateChanged subscriber
        }
      } catch {
        // No pending redirect — normal page load, continue below
      }

      if (cancelled) return;

      // 2. Auth state listener (normal page loads & popup flows)
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
              // Unauthenticated state is expected during app startup or after logout.
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
          popupError.code === "auth/cancelled-popup-request"
        ) {
          await signInWithRedirect(auth, provider);
          // Browser will redirect away — execution stops here.
          // socialLoginInProgress stays true so onAuthStateChanged won't
          // race when the redirect returns.
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

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
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
