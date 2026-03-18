"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Button, Input } from "@heroui/react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { useTranslationNamespace } from "@/contexts/TranslationContext";
import toast from "react-hot-toast";

type FormData = { email: string };

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { t } = useTranslationNamespace("auth.forgotPassword");

  const schema = z.object({
    email: z.string().email(t("errors.emailNotFound")),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${appUrl}/reset-password`,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      setSent(true);
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
            {sent ? (
              <div className="space-y-6 text-center">
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <p className="text-sm text-gray-50">{t("sent.message")}</p>
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/80 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                  onPress={() => router.push("/login")}
                >
                  {t("sent.backToLogin")}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label={t("form.email")}
                  type="email"
                  placeholder={t("form.emailPlaceholder")}
                  variant="bordered"
                  {...register("email")}
                  isInvalid={!!errors.email}
                  errorMessage={errors.email?.message}
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

                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="w-full flex items-center justify-center gap-2 text-sm text-gray-50 hover:text-white transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  {t("form.backToLogin")}
                </button>
              </form>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
