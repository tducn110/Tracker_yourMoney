"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  AuthProvider as FirebaseAuthProvider
} from "firebase/auth";
import { auth, googleProvider, facebookProvider, githubProvider, appleProvider } from "../../_lib/firebase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  fullName?: string;
  username?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const socialLoginInProgress = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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
          } else {
            // Token expired or invalid at backend
            let errorText = "";
            try {
              errorText = await response.text();
            } catch {
              errorText = "[response.text() failed]";
            }
            console.error(
              `Auth /me failed: HTTP ${response.status} ${response.statusText} — ${errorText || "(empty body)"}`,
            );
            setUser(null);
          }
        } catch (error) {
          console.error("Sync user error:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithSocial = async (provider: FirebaseAuthProvider) => {
    socialLoginInProgress.current = true;
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const response = await fetch("/api/auth/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        credentials: "include",
      });

      if (!response.ok) {
        let errorText = "";
        try {
          errorText = await response.text();
        } catch {
          errorText = "[response.text() failed]";
        }
        console.error(
          `Auth /social failed: HTTP ${response.status} ${response.statusText} — ${errorText || "(empty body)"}`,
        );
        throw new Error("Xác thực với backend thất bại");
      }

      const data = await response.json();
      setUser(data.data.user);
      router.push("/");
    } catch (error: any) {
      console.error("Social login error:", error);
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
  const loginWithFacebook = () => loginWithSocial(facebookProvider);
  const loginWithGithub = () => loginWithSocial(githubProvider);
  const loginWithApple = () => loginWithSocial(appleProvider);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      setUser(null);
      router.push("/login");
      toast.success("Đã đăng xuất");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Lỗi khi đăng xuất");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      loginWithGoogle, 
      loginWithFacebook,
      loginWithGithub,
      loginWithApple,
      logout 
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
