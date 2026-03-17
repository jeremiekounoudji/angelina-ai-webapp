"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Link,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CompanyType } from "@/types/database";
import { useAuthActions } from "@/hooks/useAuth";
import { useAppStore } from "@/store";
import { useTranslationNamespace } from "@/contexts/TranslationContext";
import { TranslationFunction } from "@/locales";
import { createClient } from "@/lib/supabase/client";
import toast from 'react-hot-toast';

const createStep1Schema = (t: TranslationFunction) => z
  .object({
    firstName: z.string().min(1, t('errors.weakPassword')),
    lastName: z.string().min(1, t('errors.weakPassword')),
    email: z.string().email(t('errors.emailExists')),
    phone: z.string().min(8, 'WhatsApp number is required (min 8 digits)'),
    password: z.string().min(6, t('errors.weakPassword')),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: t('errors.termsNotAccepted'),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: t('errors.passwordMismatch'),
    path: ["confirmPassword"],
  });

const createOtpSchema = (t: TranslationFunction) => z.object({
  otp: z.string().min(6, t('errors.invalidOtp')).max(6, t('errors.invalidOtp')),
});

const createStep2Schema = (t: TranslationFunction) => z.object({
  companyName: z.string().min(1, t('errors.registrationFailed')),
  companyType: z.enum(["restaurant", "retail", "service", "other"]),
  address: z.string().optional(),
  phone: z.string().min(8, 'Company WhatsApp number is required (min 8 digits)'),
  companyEmail: z.string().email(t('errors.emailExists')).optional().or(z.literal("")),
  description: z.string().optional(),
});

type Step1FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

type OtpFormData = {
  otp: string;
};

type Step2FormData = {
  companyName: string;
  companyType: CompanyType;
  address?: string;
  phone: string;
  companyEmail?: string;
  description?: string;
};

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [userCredentials, setUserCredentials] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  } | null>(null);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { signUp, verifyOtp, resendOtp } = useAuthActions();
  const { loading, setLoading, setError } = useAppStore();
  const { t } = useTranslationNamespace('auth.register');

  const step1Schema = useMemo(() => createStep1Schema(t), [t]);
  const otpSchema = useMemo(() => createOtpSchema(t), [t]);
  const step2Schema = useMemo(() => createStep2Schema(t), [t]);

  const step1Form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  const step2Form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
  });

  const companyTypes: { value: CompanyType; label: string }[] = [
    { value: "restaurant", label: "Restaurant" },
    { value: "retail", label: "Retail" },
    { value: "service", label: "Service" },
    { value: "other", label: "Other" },
  ];

  const onStep1Submit = async (data: Step1FormData) => {
    const result = await signUp(data);
    if (result.success) {
      setUserCredentials({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      otpForm.reset({ otp: '' });
      setCurrentStep(2); // Move to OTP verification
      startOtpCountdown();
    }
  };

  const onOtpSubmit = async (data: OtpFormData) => {
    if (!userCredentials) return;
    
    console.log('Starting OTP verification...');
    const result = await verifyOtp(userCredentials.email, data.otp);
    console.log('OTP verification result:', result);
    
    if (result.success) {
      console.log('OTP verified successfully, moving to step 3');
      setCurrentStep(3); // Move to company information
    } else {
      console.log('OTP verification failed:', result.error);
    }
  };

  const onStep3Submit = async (data: Step2FormData) => {
    if (!userCredentials) return;

    try {
      setLoading('users', true);
      setError('users', null);

      // Get the current user (should be authenticated after OTP verification)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        const errorMessage = "User not authenticated. Please verify your email first.";
        toast.error(errorMessage);
        return;
      }

      console.log("Calling RPC to finalize registration with company info", {
        p_auth_user_id: user.id,
        p_email: userCredentials.email,
        p_first_name: userCredentials.firstName,
        p_last_name: userCredentials.lastName,
        p_phone: userCredentials.phone,
        p_company_name: data.companyName,
        p_company_type: data.companyType,
        p_company_address: data.address || null,
        p_company_phone: data.phone || null,
        p_company_email: data.companyEmail || null,
        p_company_description: data.description || null,
      });

      // Call RPC function to create company and user record atomically
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "register_user_and_company",
        {
          p_auth_user_id: user.id,
          p_email: userCredentials.email,
          p_first_name: userCredentials.firstName,
          p_last_name: userCredentials.lastName,
          p_phone: userCredentials.phone,
          p_company_name: data.companyName,
          p_company_type: data.companyType,
          p_company_address: data.address || null,
          p_company_phone: data.phone || null,
          p_company_email: data.companyEmail || null,
          p_company_description: data.description || null,
        }
      );

      console.log("RPC result", rpcData, rpcError);

      if (rpcError) {
        const errorMessage = "Registration failed: " + rpcError.message;
        toast.error(errorMessage);
        return;
      }

      if (!rpcData[0].success) {
        const errorMessage = "Registration failed: " + rpcData[0].message;
        toast.error(errorMessage);
        return;
      }

      toast.success('Account created successfully!');
      router.push("/plan-list");
    } catch (err) {
      console.error("Unexpected error:", err);
      const errorMessage = "An unexpected error occurred";
      toast.error(errorMessage);
    } finally {
      setLoading('users', false);
    }
  };

  const handleResendOtp = async () => {
    if (!userCredentials || isResendingOtp || otpCountdown > 0) return;
    
    setIsResendingOtp(true);
    const result = await resendOtp(userCredentials.email);
    if (result.success) {
      startOtpCountdown();
    }
    setIsResendingOtp(false);
  };

  const startOtpCountdown = () => {
    setOtpCountdown(60);
    const interval = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const goBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Image from Unsplash */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')"
        }}
      />
      {/* Dark Blur Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-white">
            {t('title')}
          </h2>
          <p className="mt-2 text-sm text-gray-50">
            {t('footer.hasAccount')}{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/80"
            >
              {t('footer.signIn')}
            </Link>
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 1
                ? "bg-primary text-white"
                : "bg-secondary text-gray-50"
            }`}
          >
            1
          </div>
          <div
            className={`w-16 h-1 ${
              currentStep >= 2 ? "bg-primary" : "bg-secondary"
            }`}
          />
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 2
                ? "bg-primary text-white"
                : "bg-secondary text-gray-50"
            }`}
          >
            2
          </div>
          <div
            className={`w-16 h-1 ${
              currentStep >= 3 ? "bg-primary" : "bg-secondary"
            }`}
          />
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 3
                ? "bg-primary text-white"
                : "bg-secondary text-gray-50"
            }`}
          >
            3
          </div>
        </div>

        <Card className="mt-8 bg-background backdrop-blur-sm border border-secondary shadow-lg shadow-secondary/20">
          <CardHeader className="text-center">
            <h3 className="text-lg font-medium text-white">
              {currentStep === 1
                ? t('steps.account')
                : currentStep === 2
                ? t('steps.verification')
                : t('steps.company')}
            </h3>
          </CardHeader>
          <CardBody>
            {currentStep === 1 ? (
              <form
                onSubmit={step1Form.handleSubmit(onStep1Submit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('form.firstName')}
                    placeholder={t('form.firstNamePlaceholder')}
                    variant="bordered"
                    {...step1Form.register("firstName")}
                    isInvalid={!!step1Form.formState.errors.firstName}
                    errorMessage={step1Form.formState.errors.firstName?.message}
                    isRequired
                    classNames={{
                      input: "text-white",
                      label: "text-gray-50",
                      inputWrapper: "border-secondary bg-background"
                    }}
                  />

                  <Input
                    label={t('form.lastName')}
                    placeholder={t('form.lastNamePlaceholder')}
                    variant="bordered"
                    {...step1Form.register("lastName")}
                    isInvalid={!!step1Form.formState.errors.lastName}
                    errorMessage={step1Form.formState.errors.lastName?.message}
                    isRequired
                    classNames={{
                      input: "text-white",
                      label: "text-gray-50",
                      inputWrapper: "border-secondary bg-background"
                    }}
                  />
                </div>

                <Input
                  label={t('form.email')}
                  type="email"
                  placeholder={t('form.emailPlaceholder')}
                  variant="bordered"
                  {...step1Form.register("email")}
                  isInvalid={!!step1Form.formState.errors.email}
                  errorMessage={step1Form.formState.errors.email?.message}
                  isRequired
                  classNames={{
                    input: "text-white",
                    label: "text-gray-50",
                    inputWrapper: "border-secondary bg-background"
                  }}
                />

                <Input
                  label={t('form.phone')}
                  type="tel"
                  placeholder={t('form.phonePlaceholder')}
                  variant="bordered"
                  {...step1Form.register("phone")}
                  isInvalid={!!step1Form.formState.errors.phone}
                  errorMessage={step1Form.formState.errors.phone?.message}
                  isRequired
                  classNames={{
                    input: "text-white",
                    label: "text-gray-50",
                    inputWrapper: "border-secondary bg-background"
                  }}
                />

                {/* Admin WhatsApp Warning */}
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-gray-50 leading-relaxed">
                      {t('form.phoneWarning')}
                    </p>
                  </div>
                </div>

                <Input
                  label={t('form.password')}
                  placeholder={t('form.passwordPlaceholder')}
                  variant="bordered"
                  {...step1Form.register("password")}
                  isInvalid={!!step1Form.formState.errors.password}
                  errorMessage={step1Form.formState.errors.password?.message}
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
                  classNames={{
                    input: "text-white",
                    label: "text-gray-50",
                    inputWrapper: "border-secondary bg-background"
                  }}
                />

                <Input
                  label={t('form.confirmPassword')}
                  placeholder={t('form.confirmPasswordPlaceholder')}
                  variant="bordered"
                  {...step1Form.register("confirmPassword")}
                  isInvalid={!!step1Form.formState.errors.confirmPassword}
                  errorMessage={
                    step1Form.formState.errors.confirmPassword?.message
                  }
                  type={isVisible ? "text" : "password"}
                  isRequired
                  classNames={{
                    input: "text-white",
                    label: "text-gray-50",
                    inputWrapper: "border-secondary bg-background"
                  }}
                />

                {/* Terms and Conditions Checkbox */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    {...step1Form.register("acceptTerms")}
                    className="mt-1 w-4 h-4 text-primary bg-background border-secondary rounded focus:ring-primary focus:ring-2"
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-gray-50">
                    {t('form.agreeToTerms')}{' '}
                    <Link href="/terms" target="_blank" className="text-primary hover:text-primary/80 underline">
                      {t('form.termsOfService')}
                    </Link>
                    {' '}{t('form.and')}{' '}
                    <Link href="/privacy" target="_blank" className="text-primary hover:text-primary/80 underline">
                      {t('form.privacyPolicy')}
                    </Link>
                  </label>
                </div>
                {step1Form.formState.errors.acceptTerms && (
                  <p className="text-xs text-danger">
                    {step1Form.formState.errors.acceptTerms.message}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/80 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg shadow-secondary/20"
                  isLoading={loading.users}
                  isDisabled={loading.users}
                >
                  {t('form.continue')}
                </Button>
              </form>
            ) : currentStep === 2 ? (
              <form
                onSubmit={otpForm.handleSubmit(onOtpSubmit)}
                className="space-y-6"
              >
                <div className="text-center">
                  <p className="text-sm text-gray-50 mb-4">
                    {t('form.otpSent')} <span className="font-medium">{userCredentials?.email}</span>
                  </p>
                </div>

                <Input
                  label={t('form.otpCode')}
                  placeholder={t('form.otpCodePlaceholder')}
                  variant="bordered"
                  {...otpForm.register("otp")}
                  isInvalid={!!otpForm.formState.errors.otp}
                  errorMessage={otpForm.formState.errors.otp?.message}
                  isRequired
                  maxLength={6}
                  autoComplete="one-time-code"
                  classNames={{
                    input: "text-white text-center text-lg tracking-widest",
                    label: "text-gray-50",
                    inputWrapper: "border-secondary bg-background"
                  }}
                />

                <div className="text-center">
                  <Button
                    type="button"
                    variant="light"
                    className="text-primary hover:text-primary/80"
                    onPress={handleResendOtp}
                    isDisabled={isResendingOtp || otpCountdown > 0}
                    isLoading={isResendingOtp}
                  >
                    {otpCountdown > 0 
                      ? t('form.resendOtpCountdown', { seconds: otpCountdown })
                      : t('form.resendOtp')
                    }
                  </Button>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    className="flex-1 bg-transparent border border-secondary text-gray-50 hover:text-white hover:border-primary transition-colors duration-200"
                    startContent={<ArrowLeftIcon className="w-4 h-4" />}
                    onPress={goBack}
                    isDisabled={loading.users}
                  >
                    {t('form.back')}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/80 text-white font-semibold transition-all duration-300 shadow-lg shadow-secondary/20"
                    isLoading={loading.users}
                    isDisabled={loading.users}
                  >
                    {t('form.verify')}
                  </Button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={step2Form.handleSubmit(onStep3Submit)}
                className="space-y-6"
              >
                <Input
                  label={t('form.companyName')}
                  placeholder={t('form.companyNamePlaceholder')}
                  variant="bordered"
                  {...step2Form.register("companyName")}
                  isInvalid={!!step2Form.formState.errors.companyName}
                  errorMessage={step2Form.formState.errors.companyName?.message}
                  isRequired
                  classNames={{
                    input: "text-white",
                    label: "text-gray-50",
                    inputWrapper: "border-secondary bg-background"
                  }}
                />

                <Select
                  label={t('form.companyType')}
                  placeholder={t('form.companyTypePlaceholder')}
                  variant="bordered"
                  {...step2Form.register("companyType")}
                  isInvalid={!!step2Form.formState.errors.companyType}
                  errorMessage={step2Form.formState.errors.companyType?.message}
                  isRequired
                  classNames={{
                    trigger: "border-secondary bg-background",
                    label: "text-gray-50",
                    value: "text-white"
                  }}
                >
                  {companyTypes.map((type) => (
                    <SelectItem key={type.value}>{type.label}</SelectItem>
                  ))}
                </Select>

                <Input
                  label={t('form.companyEmail')}
                  type="email"
                  placeholder={t('form.companyEmailPlaceholder')}
                  variant="bordered"
                  {...step2Form.register("companyEmail")}
                  isInvalid={!!step2Form.formState.errors.companyEmail}
                  errorMessage={
                    step2Form.formState.errors.companyEmail?.message
                  }
                  classNames={{
                    input: "text-white",
                    label: "text-gray-50",
                    inputWrapper: "border-secondary bg-background"
                  }}
                />

                <Input
                  label={t('form.companyPhone')}
                  placeholder={t('form.companyPhonePlaceholder')}
                  variant="bordered"
                  {...step2Form.register("phone")}
                  isInvalid={!!step2Form.formState.errors.phone}
                  errorMessage={step2Form.formState.errors.phone?.message}
                  isRequired
                  classNames={{
                    input: "text-white",
                    label: "text-gray-50",
                    inputWrapper: "border-secondary bg-background"
                  }}
                />

                {/* Company WhatsApp Warning */}
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-gray-50 leading-relaxed">
                      {t('form.companyPhoneWarning')}
                    </p>
                  </div>
                </div>

                <Textarea
                  label={t('form.address')}
                  placeholder={t('form.addressPlaceholder')}
                  variant="bordered"
                  {...step2Form.register("address")}
                  isInvalid={!!step2Form.formState.errors.address}
                  errorMessage={step2Form.formState.errors.address?.message}
                  minRows={2}
                  classNames={{
                    input: "text-white",
                    label: "text-gray-50",
                    inputWrapper: "border-secondary bg-background"
                  }}
                />

                <Textarea
                  label={t('form.description')}
                  placeholder={t('form.descriptionPlaceholder')}
                  variant="bordered"
                  {...step2Form.register("description")}
                  isInvalid={!!step2Form.formState.errors.description}
                  errorMessage={step2Form.formState.errors.description?.message}
                  minRows={3}
                  classNames={{
                    input: "text-white",
                    label: "text-gray-50",
                    inputWrapper: "border-secondary bg-background"
                  }}
                />

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    className="flex-1 bg-transparent border border-secondary text-gray-50 hover:text-white hover:border-primary transition-colors duration-200"
                    startContent={<ArrowLeftIcon className="w-4 h-4" />}
                    onPress={goBack}
                    isDisabled={loading.users}
                  >
                    {t('form.back')}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/80 text-white font-semibold transition-all duration-300 shadow-lg shadow-secondary/20"
                    isLoading={loading.users}
                    isDisabled={loading.users}
                  >
                    {t('form.submit')}
                  </Button>
                </div>
              </form>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
