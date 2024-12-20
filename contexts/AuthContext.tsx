"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@/lib/types";
import { Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  requireAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Protected routes configuration
const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password"];
const AUTH_ROUTES = ["/login", "/signup"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [requireAuth, setRequireAuth] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // Initialize Supabase client with SSR
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch additional user data from your users table
  const fetchUserData = async (userId: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user data:", error);
      return null;
    }

    return data as User;
  };

  // Handle route protection
  useEffect(() => {
    if (loading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isAuthRoute = AUTH_ROUTES.includes(pathname);
    const hasValidSession = !!session && !!user;

    if (!hasValidSession && !isPublicRoute) {
      setRequireAuth(true);
      setShowAuthModal(true);
    } else if (hasValidSession && isAuthRoute) {
      router.push('/');
      setShowAuthModal(false);
      setRequireAuth(false);
    } else {
      setRequireAuth(false);
    }
  }, [session, loading, pathname, user]);

  // Handle auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);

      if (currentSession?.user) {
        const userData = await fetchUserData(currentSession.user.id);
        if (userData) {
          setUser(userData);
          setShowAuthModal(false);
          setRequireAuth(false);
        } else {
          // If we can't fetch user data, log them out
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setShowAuthModal(true);
          setRequireAuth(true);
        }
      } else {
        setUser(null);
        if (!PUBLIC_ROUTES.includes(pathname)) {
          setShowAuthModal(true);
          setRequireAuth(true);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [pathname]);

  const refreshUser = async () => {
    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      if (!currentSession?.user) {
        setUser(null);
        return;
      }

      const userData = await fetchUserData(currentSession.user.id);
      setUser(userData);
    } catch (err) {
      console.error("Error refreshing user:", err);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      router.push("/");
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);

      // Sign up with Supabase Auth
      const {
        data: { user: authUser },
        error: signUpError,
      } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      if (!authUser) throw new Error("No user returned after signup");

      // Create user record in your users table
      const { error: userError } = await supabase.from("users").insert([
        {
          id: authUser.id,
          email,
          name,
          status: "user",
          role: "user",
        },
      ]);

      if (userError) throw userError;

      router.push("/");
    } catch (err: any) {
      setError(err.message || "An error occurred during signup");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setShowAuthModal(true);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        error,
        login,
        logout,
        signup,
        refreshUser,
        showAuthModal,
        setShowAuthModal,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}