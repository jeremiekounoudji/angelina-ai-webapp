"use client";

import { useCallback, useMemo } from "react";
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
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  
  const {
    setLoading,
    setError,
    clearAll,
  } = useAppStore();

  const signIn = useCallback(async (data: LoginData) => {
    console.log('signIn called with:', { email: data.email });
    
    try {
      console.log('Setting loading to true');
      setLoading('users', true);
      setError('users', null);

      console.log('Calling supabase.auth.signInWithPassword');
      
      // Add timeout to prevent infinite hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Sign in timeout after 30 seconds')), 30000);
      });

      const signInPromise = supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      const result = await Promise.race([signInPromise, timeoutPromise]) as Awaited<typeof signInPromise>;
      
      console.log('Sign in result:', result);

      if (result.error) {
        console.error('Sign in error:', result.error);
        toast.error(result.error.message);
        return { success: false, error: result.error.message };
      }

      console.log('Sign in successful, redirecting to dashboard');
      toast.success('Successfully signed in!');
      router.push("/dashboard");
      return { success: true };
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      console.log('Setting loading to false');
      setLoading('users', false);
    }
  }, [
    router, setError, setLoading,  supabase.auth
  ]);

  const signUp = useCallback(async (step1Data: RegisterStep1Data) => {
    try {
      setLoading('users', true);
      setError('users', null);

      console.log("Starting registration process - creating user account");

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: step1Data.email,
        password: step1Data.password,
        options: {
          data: {
            first_name: step1Data.firstName,
            last_name: step1Data.lastName,
          },
          emailRedirectTo: undefined, // We'll handle verification manually
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

      toast.success('Verification code sent to your email!');
      return { success: true };
    } catch (err) {
      console.error("Unexpected error:", err);
      const errorMessage = "An unexpected error occurred";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading('users', false);
    }
  }, [supabase, setLoading, setError]);

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

  const verifyOtp = useCallback(async (email: string, token: string) => {
    try {
      console.log('verifyOtp: Setting loading to true');
      setLoading('users', true);
      setError('users', null);

      console.log('verifyOtp: Calling supabase.auth.verifyOtp');
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      console.log('verifyOtp: Result:', { data, error });

      if (error) {
        console.log('verifyOtp: Error occurred:', error.message);
        toast.error(error.message);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        const errorMessage = "Failed to verify email";
        console.log('verifyOtp: No user in response');
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }

      console.log('verifyOtp: Success!');
      toast.success('Email verified successfully!');
      return { success: true, user: data.user, session: data.session };
    } catch (err) {
      console.error('verifyOtp: Unexpected error:', err);
      const errorMessage = "Failed to verify email";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      console.log('verifyOtp: Setting loading to false');
      setLoading('users', false);
    }
  }, [supabase, setLoading, setError]);

  const resendOtp = useCallback(async (email: string) => {
    try {
      setLoading('users', true);
      setError('users', null);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        toast.error(error.message);
        return { success: false, error: error.message };
      }

      toast.success('Verification code sent!');
      return { success: true };
    } catch (err) {
      console.error('Unexpected error resending OTP:', err);
      const errorMessage = "Failed to resend verification code";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading('users', false);
    }
  }, [supabase, setLoading, setError]);

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession,
    getCurrentUser,
    verifyOtp,
    resendOtp,
  };
}