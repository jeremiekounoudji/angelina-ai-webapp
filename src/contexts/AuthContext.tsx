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
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setCompany: (company: Company | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const { clearAll } = useAppStore();
  const initRef = useRef(false);

  const refreshUser = useCallback(async () => {
    console.log("Refreshing user");
    
    try {
      setLoading(true);
      
      // First check if there's a session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No session found");
        setUser(null);
        setCompany(null);
        return;
      }

      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error getting user:", error);
        setUser(null);
        setCompany(null);
        return;
      }

      setUser(currentUser);
      if (currentUser) {
        console.log("User found:", currentUser.id);
        console.log("Fetching user's company");

        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("*")
          .eq("user_id", currentUser.id)
          .single();

        if (companyError) {
          console.error("Error fetching company:", companyError);
          setCompany(null);
        } else if (companyData) {
          console.log("Company found:", companyData.id);
          setCompany(companyData);
        } else {
          setCompany(null);
        }
      } else {
        setCompany(null);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(null);
      setCompany(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const initializeAuth = async () => {
      if (initRef.current) return;
      initRef.current = true;

      try {
        console.log("Starting auth initialization");
        await refreshUser();
      } catch (error) {
        console.error("Error initializing auth:", error);
        setUser(null);
        setCompany(null);
      } finally {
        console.log("Auth initialization complete");
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: { user: User } | null) => {
      console.log("Auth state change:", event, session?.user?.id);
      
      if (event === "SIGNED_IN" && session?.user) {
        // Refresh user and company data when signed in
        await refreshUser();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setCompany(null);
        clearAll();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, clearAll, refreshUser]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setCompany(null);
      clearAll();

      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error signing out:", error);
      // Still redirect even if there's an error
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }, [supabase, clearAll]);

  return (
    <AuthContext.Provider
      value={{ user, company, loading, signOut, refreshUser, setCompany }}
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
