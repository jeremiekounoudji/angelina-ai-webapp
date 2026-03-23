"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Company } from "@/types/database";
import { useAppStore } from "@/store";

interface AuthContextType {
  user: User | null;
  company: Company | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setCompany: (company: Company | null) => void;
  retry: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const { clearAll } = useAppStore();
  const initRef = useRef(false);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Get session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!session) {
        setUser(null);
        setCompany(null);
        return;
      }

      // 2. Fetch user + company in parallel
      const [userRes, companyRes] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("companies").select("*").eq("user_id", session.user.id).single(),
      ]);

      if (userRes.error) throw userRes.error;

      setUser(userRes.data.user);
      setCompany(companyRes.data ?? null);
      setError(null);
    } catch (err: unknown) {
      const authErr = err as { code?: string; status?: number };
      // Invalid/expired refresh token — clear local session so user gets a clean login
      if (authErr?.code === 'refresh_token_not_found' || authErr?.status === 400) {
        await supabase.auth.signOut();
        setUser(null);
        setCompany(null);
        clearAll();
        return;
      }
      console.error("Auth refresh failed");
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const retry = useCallback(() => {
    setError(null);
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      refreshUser();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          // During registration, just set the user — company doesn't exist yet
          const isRegistering = typeof window !== "undefined" &&
            window.location.pathname.startsWith("/register");
          if (isRegistering) {
            setUser(session.user);
            return;
          }
          setUser(session.user);
          refreshUser();
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setCompany(null);
        clearAll();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, refreshUser, clearAll]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setCompany(null);
      clearAll();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } catch {
      // Redirect to login regardless of error
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }, [supabase, clearAll]);

  return (
    <AuthContext.Provider
      value={{ user, company, loading, error, signOut, refreshUser, setCompany, retry }}
    >
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
