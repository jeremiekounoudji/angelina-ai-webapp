"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Button, Input, Link } from "@heroui/react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthActions } from "@/hooks/useAuth";
import { useAppStore } from "@/store";
import { useTranslationNamespace } from "@/contexts/TranslationContext";
import { useAuth } from "@/contexts/AuthContext";

const createLoginSchema = (t: any) => z.object({
  email: z.string().email(t('errors.invalidCredentials')),
  password: z.string().min(6, t('errors.invalidCredentials')),
});

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const { signIn } = useAuthActions();
  const { loading } = useAppStore();
  const { t, locale } = useTranslationNamespace('auth.login');
  const { user, loading: authLoading } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const loginSchema = useMemo(() => createLoginSchema(t), [locale]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    await signIn(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-secondary to-background"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-white">
            {t('title')}
          </h2>
          <p className="mt-2 text-sm text-gray-50">
            {t('footer.noAccount')}{" "}
            <button
              onClick={() => router.push("/register")}
              className="font-medium text-primary hover:text-primary/80 underline cursor-pointer"
            >
              {t('footer.signUp')}
            </button>
          </p>
        </div>

        <Card className="mt-8 bg-background backdrop-blur-sm border border-secondary shadow-lg shadow-secondary/20">
          <CardHeader className="text-center">
            <h3 className="text-lg font-medium text-white">{t('subtitle')}</h3>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label={t('form.email')}
                type="email"
                placeholder={t('form.emailPlaceholder')}
                {...register("email")}
                isInvalid={!!errors.email}
                variant="bordered"
                className="text-gray-50"

                errorMessage={errors.email?.message}
                isRequired
              />

              <Input
                label={t('form.password')}
                placeholder={t('form.passwordPlaceholder')}
                variant="bordered"
                {...register("password")}
                isInvalid={!!errors.password}
                className="text-gray-50"
                errorMessage={errors.password?.message}
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={() => setIsVisible(!isVisible)}
                  >
                    {isVisible ? (
                      <EyeSlashIcon className="w-5 h-5 text-gray-50" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-gray-50" />
                    )}
                  </button>
                }
                type={isVisible ? "text" : "password"}
                isRequired
              />

              <div className="flex items-center justify-between">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80"
                >
                  {t('form.forgotPassword')}
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/80 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg shadow-secondary/20"
                isLoading={loading.users}
                isDisabled={loading.users}
              >
                {t('form.submit')}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
