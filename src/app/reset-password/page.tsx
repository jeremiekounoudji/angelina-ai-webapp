"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardBody, CardHeader, Button, Input } from "@heroui/react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { useTranslationNamespace } from "@/contexts/TranslationContext";
import toast from "react-hot-toast";
import { createTranslationFunction, DEFAULT_LOCALE, type Locale } from "@/locales";

function getT() {
  const locale = (typeof window !== 'undefined' ? localStorage.getItem('locale') : null) as Locale | null;
  return createTranslationFunction(locale ?? DEFAULT_LOCALE);
}

type FormData = { password: string; confirmPassword: string };

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [exchanging, setExchanging] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const { t } = useTranslationNamespace("auth.resetPassword");

  const schema = z
    .object({
      password: z.string()
        .min(8, t("errors.passwordTooShort"))
        .regex(/[A-Z]/, t("errors.passwordNeedsUppercase"))
        .regex(/[0-9]/, t("errors.passwordNeedsNumber")),
      confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: t("errors.passwordMismatch"),
      path: ["confirmPassword"],
    });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Exchange the ?code= param for a valid session
  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setExchanging(false);
      setSessionReady(false);
      return;
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        toast.error(getT()('hooks.auth.errors.invalidResetLink'));
        router.replace("/forgot-password");
      } else {
        setSessionReady(true);
      }
      setExchanging(false);
    });
  }, [searchParams, supabase, router]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(getT()('hooks.auth.success.passwordUpdated'));
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 relative">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')",
        }}
      />
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-white">{t("title")}</h2>
          <p className="mt-2 text-sm text-gray-50">{t("subtitle")}</p>
        </div>

        <Card className="mt-8 bg-background backdrop-blur-sm border border-secondary shadow-lg shadow-secondary/20">
          <CardHeader className="text-center">
            <h3 className="text-lg font-medium text-white">{t("cardTitle")}</h3>
          </CardHeader>
          <CardBody>
            {exchanging ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !sessionReady ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-gray-50">This reset link is invalid or has expired.</p>
                <Button
                  className="w-full bg-primary hover:bg-primary/80 text-white font-semibold py-3 rounded-lg"
                  onPress={() => router.push("/forgot-password")}
                >
                  Request a new link
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label={t("form.password")}
                placeholder={t("form.passwordPlaceholder")}
                variant="bordered"
                {...register("password")}
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message}
                type={isVisible ? "text" : "password"}
                isRequired
                endContent={
                  <button
                    type="button"
                    className="focus:outline-none"
                    onClick={() => setIsVisible(!isVisible)}
                  >
                    {isVisible ? (
                      <EyeSlashIcon className="w-5 h-5 text-gray-50" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-gray-50" />
                    )}
                  </button>
                }
                classNames={{
                  input: "text-white",
                  label: "text-gray-50",
                  inputWrapper: "border-secondary bg-background",
                }}
              />

              <Input
                label={t("form.confirmPassword")}
                placeholder={t("form.confirmPasswordPlaceholder")}
                variant="bordered"
                {...register("confirmPassword")}
                isInvalid={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword?.message}
                type={isVisible ? "text" : "password"}
                isRequired
                classNames={{
                  input: "text-white",
                  label: "text-gray-50",
                  inputWrapper: "border-secondary bg-background",
                }}
              />

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/80 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg shadow-secondary/20"
                isLoading={loading}
                isDisabled={loading}
              >
                {t("form.submit")}
              </Button>
            </form>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
