"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store";
import toast from "react-hot-toast";
import { createTranslationFunction, DEFAULT_LOCALE, type Locale } from "@/locales";

function getT() {
  const locale = (typeof window !== "undefined" ? localStorage.getItem("locale") : null) as Locale | null;
  return createTranslationFunction(locale ?? DEFAULT_LOCALE);
}

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

export function useAuthActions() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const { setLoading, setError, clearAll } = useAppStore();

  const signIn = useCallback(
    async (data: LoginData) => {
      try {
        setLoading("users", true);
        setError("users", null);

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Sign in timeout after 30 seconds")), 30_000)
        );

        const result = await Promise.race([
          supabase.auth.signInWithPassword({ email: data.email, password: data.password }),
          timeoutPromise,
        ]);

        if (result.error) {
          toast.error(result.error.message);
          return { success: false, error: result.error.message };
        }

        toast.success(getT()("hooks.auth.success.signedIn"));
        router.push("/dashboard");
        return { success: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : getT()("hooks.auth.errors.unexpectedError");
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading("users", false);
      }
    },
    [router, setError, setLoading, supabase]
  );

  const signUp = useCallback(
    async (step1Data: RegisterStep1Data) => {
      try {
        setLoading("users", true);
        setError("users", null);

        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: step1Data.email,
          password: step1Data.password,
          options: {
            data: {
              first_name: step1Data.firstName,
              last_name: step1Data.lastName,
            },
            emailRedirectTo: undefined,
          },
        });

        if (signUpError) {
          toast.error(signUpError.message);
          return { success: false, error: signUpError.message };
        }

        if (!authData.user) {
          const errorMessage = getT()("hooks.auth.errors.createAccountFailed");
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }

        toast.success(getT()("hooks.auth.success.verificationSent"));
        return { success: true };
      } catch {
        const errorMessage = getT()("hooks.auth.errors.unexpectedError");
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading("users", false);
      }
    },
    [supabase, setLoading, setError]
  );

  const signOut = useCallback(async () => {
    try {
      setLoading("users", true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        return { success: false, error: error.message };
      }
      clearAll();
      toast.success(getT()("hooks.auth.success.signedOut"));
      router.push("/login");
      return { success: true };
    } catch {
      const errorMessage = getT()("hooks.auth.errors.unexpectedError");
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading("users", false);
    }
  }, [supabase, router, setLoading, clearAll]);

  const resetPassword = useCallback(
    async (email: string) => {
      try {
        setLoading("users", true);
        setError("users", null);
        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL ??
          (typeof window !== "undefined" ? window.location.origin : "");
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${appUrl}/reset-password`,
        });
        if (error) {
          toast.error(error.message);
          return { success: false, error: error.message };
        }
        toast.success(getT()("hooks.auth.success.passwordResetSent"));
        return { success: true };
      } catch {
        const errorMessage = getT()("hooks.auth.errors.passwordResetFailed");
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading("users", false);
      }
    },
    [supabase, setLoading, setError]
  );

  const updatePassword = useCallback(
    async (newPassword: string) => {
      try {
        setLoading("users", true);
        setError("users", null);
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          toast.error(error.message);
          return { success: false, error: error.message };
        }
        toast.success(getT()("hooks.auth.success.passwordUpdated"));
        return { success: true };
      } catch {
        const errorMessage = getT()("hooks.auth.errors.passwordUpdateFailed");
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading("users", false);
      }
    },
    [supabase, setLoading, setError]
  );

  const verifyOtp = useCallback(
    async (email: string, token: string) => {
      try {
        setLoading("users", true);
        setError("users", null);
        const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
        if (error) {
          toast.error(error.message);
          return { success: false, error: error.message };
        }
        if (!data.user) {
          const errorMessage = getT()("hooks.auth.errors.verifyEmailFailed");
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
        toast.success(getT()("hooks.auth.success.emailVerified"));
        return { success: true, user: data.user, session: data.session };
      } catch {
        const errorMessage = getT()("hooks.auth.errors.verifyEmailFailed");
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading("users", false);
      }
    },
    [supabase, setLoading, setError]
  );

  const resendOtp = useCallback(
    async (email: string) => {
      try {
        setLoading("users", true);
        setError("users", null);
        const { error } = await supabase.auth.resend({ type: "signup", email });
        if (error) {
          toast.error(error.message);
          return { success: false, error: error.message };
        }
        toast.success(getT()("hooks.auth.success.codeSent"));
        return { success: true };
      } catch {
        const errorMessage = getT()("hooks.auth.errors.resendFailed");
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading("users", false);
      }
    },
    [supabase, setLoading, setError]
  );

  return { signIn, signUp, signOut, resetPassword, updatePassword, verifyOtp, resendOtp };
}
