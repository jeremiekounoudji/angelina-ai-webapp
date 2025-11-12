"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store";
import { CompanyType } from "@/types/database";
import toast from 'react-hot-toast';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterStep1Data {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

interface RegisterStep2Data {
  companyName: string;
  companyType: CompanyType;
  address?: string;
  phone?: string;
  companyEmail?: string;
  description?: string;
}

export function useAuthActions() {
  const supabase = createClient();
  const router = useRouter();
  
  const {
    setLoading,
    setError,
    clearAll,
  } = useAppStore();

  const signIn = useCallback(async (data: LoginData) => {
    try {
      setLoading('users', true);
      setError('users', null);

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        toast.error(signInError.message);
        return { success: false, error: signInError.message };
      }

      toast.success('Successfully signed in!');
      router.push("/dashboard");
      return { success: true };
    } catch {
      const errorMessage = "An unexpected error occurred";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading('users', false);
    }
  }, [supabase, router, setLoading, setError]);

  const signUp = useCallback(async (step1Data: RegisterStep1Data, step2Data: RegisterStep2Data) => {
    try {
      setLoading('users', true);
      setError('users', null);

      console.log("Starting registration process");

      // Step 1: Create user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: step1Data.email,
        password: step1Data.password,
        options: {
          data: {
            first_name: step1Data.firstName,
            last_name: step1Data.lastName,
          },
        },
      });

      console.log("Auth signup result", authData, signUpError);

      if (signUpError) {
        toast.error(signUpError.message);
        return { success: false, error: signUpError.message };
      }

      if (!authData.user) {
        const errorMessage = "Failed to create user account";
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }

      console.log("Calling RPC to finalize registration", authData, {
        p_auth_user_id: authData.user.id,
        p_email: step1Data.email,
        p_first_name: step1Data.firstName,
        p_last_name: step1Data.lastName,
        p_phone: step1Data.phone,
        p_company_name: step2Data.companyName,
        p_company_type: step2Data.companyType,
        p_company_address: step2Data.address || null,
        p_company_phone: step2Data.phone || null,
        p_company_email: step2Data.companyEmail || null,
        p_company_description: step2Data.description || null,
      });

      // Step 2: Call RPC function to create company and user record atomically
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "register_user_and_company",
        {
          p_auth_user_id: authData.user.id,
          p_email: step1Data.email,
          p_first_name: step1Data.firstName,
          p_last_name: step1Data.lastName,
          p_phone: step1Data.phone,
          p_company_name: step2Data.companyName,
          p_company_type: step2Data.companyType,
          p_company_address: step2Data.address || null,
          p_company_phone: step2Data.phone || null,
          p_company_email: step2Data.companyEmail || null,
          p_company_description: step2Data.description || null,
        }
      );

      console.log("RPC result", rpcData, rpcError);

      if (rpcError) {
        const errorMessage = "Registration failed: " + rpcError.message;
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }

      if (!rpcData[0].success) {
        const errorMessage = "Registration failed: " + rpcData.message;
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }

      toast.success('Account created successfully!');
      router.push("/dashboard");
      return { success: true };
    } catch (err) {
      console.error("Unexpected error:", err);
      const errorMessage = "An unexpected error occurred";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading('users', false);
    }
  }, [supabase, router, setLoading, setError]);

  const signOut = useCallback(async () => {
    try {
      setLoading('users', true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
        return { success: false, error: error.message };
      }

      // Clear all cached data
      clearAll();
      
      toast.success('Successfully signed out');
      router.push("/login");
      return { success: true };
    } catch {
      const errorMessage = "An unexpected error occurred during sign out";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading('users', false);
    }
  }, [supabase, router, setLoading, clearAll]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setLoading('users', true);
      setError('users', null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
        return { success: false, error: error.message };
      }

      toast.success('Password reset email sent!');
      return { success: true };
    } catch {
      const errorMessage = "Failed to send password reset email";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading('users', false);
    }
  }, [supabase, setLoading, setError]);

  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      setLoading('users', true);
      setError('users', null);

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast.error(error.message);
        return { success: false, error: error.message };
      }

      toast.success('Password updated successfully!');
      return { success: true };
    } catch {
      const errorMessage = "Failed to update password";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading('users', false);
    }
  }, [supabase, setLoading, setError]);

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        return { success: false, error: error.message };
      }

      return { success: true, session: data.session };
    } catch (err) {
      console.error('Unexpected error refreshing session:', err);
      return { success: false, error: 'Failed to refresh session' };
    }
  }, [supabase]);

  const getCurrentUser = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error getting current user:', error);
        return { success: false, error: error.message, user: null };
      }

      return { success: true, user };
    } catch (err) {
      console.error('Unexpected error getting user:', err);
      return { success: false, error: 'Failed to get current user', user: null };
    }
  }, [supabase]);

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession,
    getCurrentUser,
  };
}