"use client";

import { useState } from "react";
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
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CompanyType } from "@/types/database";
import { useAuthActions } from "@/hooks/useAuth";
import { useAppStore } from "@/store";
import { useTranslationNamespace } from "@/contexts/TranslationContext";

const createStep1Schema = (t: any) => z
  .object({
    firstName: z.string().min(1, t('errors.weakPassword')),
    lastName: z.string().min(1, t('errors.weakPassword')),
    email: z.string().email(t('errors.emailExists')),
    phone: z.string().min(1, t('errors.weakPassword')),
    password: z.string().min(6, t('errors.weakPassword')),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: t('errors.passwordMismatch'),
    path: ["confirmPassword"],
  });

const createStep2Schema = (t: any) => z.object({
  companyName: z.string().min(1, t('errors.registrationFailed')),
  companyType: z.enum(["restaurant", "retail", "service", "other"]),
  address: z.string().optional(),
  phone: z.string().optional(),
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
};

type Step2FormData = {
  companyName: string;
  companyType: CompanyType;
  address?: string;
  phone?: string;
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
  const router = useRouter();
  const { signUp } = useAuthActions();
  const { loading } = useAppStore();
  const { t } = useTranslationNamespace('auth.register');

  const step1Schema = createStep1Schema(t);
  const step2Schema = createStep2Schema(t);

  const step1Form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
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
    setUserCredentials({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      password: data.password,
    });
    setCurrentStep(2);
  };
  const onStep2Submit = async (data: Step2FormData) => {
    if (!userCredentials) return;

    await signUp(userCredentials, data);
  };
  const goBack = () => {
    setCurrentStep(1);
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
        </div>

        <Card className="mt-8 bg-background backdrop-blur-sm border border-secondary shadow-lg shadow-secondary/20">
          <CardHeader className="text-center">
            <h3 className="text-lg font-medium text-white">
              {currentStep === 1
                ? "Account Information"
                : "Company Information"}
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
                    label="First Name"
                    placeholder="Enter your first name"
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
                    label="Last Name"
                    placeholder="Enter your last name"
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
                  label="Email address"
                  type="email"
                  placeholder="Enter your email"
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
                  label="Phone Number"
                  type="tel"
                  placeholder="Enter your phone number"
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

                <Input
                  label="Password"
                  placeholder="Enter your password"
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
                  label="Confirm Password"
                  placeholder="Confirm your password"
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

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/80 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg shadow-secondary/20"
                >
                  Continue
                </Button>
              </form>
            ) : (
              <form
                onSubmit={step2Form.handleSubmit(onStep2Submit)}
                className="space-y-6"
              >
                <Input
                  label="Company Name"
                  placeholder="Enter your company name"
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
                  label="Company Type"
                  placeholder="Select company type"
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
                  label="Company Email"
                  type="email"
                  placeholder="Enter company email (optional)"
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
                  label="Phone"
                  placeholder="Enter company phone (optional)"
                  variant="bordered"
                  {...step2Form.register("phone")}
                  isInvalid={!!step2Form.formState.errors.phone}
                  errorMessage={step2Form.formState.errors.phone?.message}
                  classNames={{
                    input: "text-white",
                    label: "text-gray-50",
                    inputWrapper: "border-secondary bg-background"
                  }}
                />

                <Textarea
                  label="Address"
                  placeholder="Enter company address (optional)"
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
                  label="Description"
                  placeholder="Enter company description (optional)"
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
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/80 text-white font-semibold transition-all duration-300 shadow-lg shadow-secondary/20"
                    isLoading={loading.users}
                    isDisabled={loading.users}
                  >
                    Create Account
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
