"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);
  const { clearAll } = useAppStore();

  const fetchUserCompany = async (userId: string) => {
    try {
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", userId)
        .single();

      console.log('Company data:', companyData, 'Error:', companyError);
      
      if (companyData) {
        setCompany(companyData);
      }
    } catch (error) {
      console.error('Error fetching user company:', error);
      setCompany(null);
    }
  };

  const refreshUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      await fetchUserCompany(user.id);
    } else {
      setCompany(null);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        console.log(user,'user log');
        setUser(user);
        if (user) {
          await fetchUserCompany(user.id);
        }
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log('Auth state change:', event, session?.user?.id);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setLoading(true);
        await fetchUserCompany(session.user.id);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setCompany(null);
        setLoading(false);
        // Clear all cached data when user signs out
        clearAll();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCompany(null);
    clearAll();
  };

  return (
    <AuthContext.Provider
      value={{ user, company, loading, signOut, refreshUser }}
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
