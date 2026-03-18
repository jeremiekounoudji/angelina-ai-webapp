"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import { SubscriptionPlan } from "@/types/database";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationNamespace } from "@/contexts/TranslationContext";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  billingInterval: "monthly" | "yearly";
  companyId: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
}

const mobileProviders = [
  // Benin
  { key: "mtn_open", label: "MTN Bénin", country: "BJ", group: "Bénin 🇧🇯" },
  { key: "moov", label: "Moov Bénin", country: "BJ", group: "Bénin 🇧🇯" },
  { key: "sbin", label: "Celtiis Bénin", country: "BJ", group: "Bénin 🇧🇯" },
  { key: "coris", label: "Coris Bénin", country: "BJ", group: "Bénin 🇧🇯" },
  // Togo
  { key: "moov_tg", label: "Moov Togo", country: "TG", group: "Togo 🇹🇬" },
  { key: "togocel", label: "T-Money (Togocel)", country: "TG", group: "Togo 🇹🇬" },
  { key: "mixx", label: "Mixx Togo", country: "TG", group: "Togo 🇹🇬" },
  // Côte d'Ivoire
  { key: "mtn_ci", label: "MTN Côte d'Ivoire", country: "CI", group: "Côte d'Ivoire 🇨🇮" },
  { key: "moov_ci", label: "Moov Côte d'Ivoire", country: "CI", group: "Côte d'Ivoire 🇨🇮" },
  { key: "wave_ci", label: "Wave Côte d'Ivoire", country: "CI", group: "Côte d'Ivoire 🇨🇮" },
  { key: "orange_ci", label: "Orange Côte d'Ivoire", country: "CI", group: "Côte d'Ivoire 🇨🇮" },
  // Senegal
  { key: "free_sn", label: "Free Sénégal", country: "SN", group: "Sénégal 🇸🇳" },
  { key: "wave_sn", label: "Wave Sénégal", country: "SN", group: "Sénégal 🇸🇳" },
  { key: "orange_sn", label: "Orange Sénégal", country: "SN", group: "Sénégal 🇸🇳" },
  // Burkina Faso
  { key: "orange_bf", label: "Orange Burkina Faso", country: "BF", group: "Burkina Faso 🇧🇫" },
  { key: "moov_bf", label: "Moov Burkina Faso", country: "BF", group: "Burkina Faso 🇧🇫" },
  // Guinea
  { key: "mtn_open_gn", label: "MTN Guinée", country: "GN", group: "Guinée 🇬🇳" },
  // Niger
  { key: "airtel_ne", label: "Airtel Niger", country: "NE", group: "Niger 🇳🇪" },
  // Cards
  { key: "visa", label: "Visa", country: "", group: "Carte bancaire 💳" },
  { key: "mastercard", label: "Mastercard", country: "", group: "Carte bancaire 💳" },
];

export default function PaymentModal({
  isOpen,
  onClose,
  plan,
  billingInterval,
  companyId,
  customerEmail,
  customerName,
  customerPhone,
}: PaymentModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [provider, setProvider] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "initialized" | "waiting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const { refreshUser } = useAuth();
  const { t } = useTranslationNamespace('dashboard.payment');
  const pathname = usePathname();

  const calculateAmount = () => {
    if (!plan) return 0;
    const monthlyPrice = parseFloat(plan.price_monthly.toString());
    if (billingInterval === "yearly") {
      const yearlyPrice = monthlyPrice * 12;
      const discount = (plan.yearly_discount_percent || 0) / 100;
      return yearlyPrice * (1 - discount);
    }
    return monthlyPrice;
  };

  const handlePayment = async () => {
    if (!plan || !phoneNumber || !provider) return;

    setLoading(true);
    setPaymentStatus("processing");
    setErrorMessage("");

    try {
      const response = await fetch("/api/fedapay-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: plan.id,
          companyId,
          billingInterval,
          phoneNumber,
          provider,
          customerEmail,
          customerName,
          customerPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment failed");
      }

      if (data.success) {
        setPaymentStatus("initialized");
        // Start polling payment status from database
        pollPaymentStatusFromDB(data.merchant_reference);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Payment failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatusFromDB = async (merchantRef: string) => {
    const maxAttempts = 18; // 3 minutes with 10-second intervals
    let attempts = 0;

    // Show waiting status after initialization
    setTimeout(() => {
      if (paymentStatus === "initialized") {
        setPaymentStatus("waiting");
      }
    }, 3000);

    const poll = async () => {
      try {
        // Use the API route to check payment status
        const response = await fetch(
          `/api/fedapay-payment/status?merchantReference=${merchantRef}`
        );

        if (!response.ok) {
          console.error("API poll error:", response.status);
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 10000);
          } else {
            setPaymentStatus("error");
            setErrorMessage(
              "Unable to check payment status. Please contact support."
            );
          }
          return;
        }

        const data = await response.json();

        if (data.status === "completed") {
          setPaymentStatus("success");
          // Refresh user data to get updated subscription
          await refreshUser();
          setTimeout(() => {
            onClose();
            // If on plan-list page, redirect to dashboard, otherwise reload
            if (pathname === "/plan-list") {
              window.location.href = "/dashboard";
            } else {
              window.location.reload();
            }
          }, 2000);
          return;
        }

        if (data.status === "failed") {
          setPaymentStatus("error");
          setErrorMessage("Payment was declined or failed. Please try again.");
          return;
        }

        // Payment is still pending, continue polling
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          setPaymentStatus("error");
          setErrorMessage(
            "Payment confirmation timeout. Your payment may still be processing. Please check your payment history."
          );
        }
      } catch (error) {
        console.error("Status check error:", error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000);
        } else {
          setPaymentStatus("error");
          setErrorMessage(
            "Unable to check payment status. Please contact support."
          );
        }
      }
    };

    // Start polling after a short delay
    setTimeout(poll, 5000);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    const selectedProvider = mobileProviders.find((p) => p.key === provider);
    if (selectedProvider) {
      switch (selectedProvider.country) {
        case "BJ": return digits; // +229 format
        case "TG": return digits; // +228 format
        case "CI": return digits; // +225 format
        case "SN": return digits; // +221 format
        case "BF": return digits; // +226 format
        case "GN": return digits; // +224 format
        case "NE": return digits; // +227 format
        default: return digits;
      }
    }
    return digits;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      isDismissable={paymentStatus !== "processing"}
      classNames={{
        base: "bg-white border-0 max-w-[450px]",
        header: "border-b border-gray-200",
        footer: "border-t border-gray-200"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold text-gray-900">{t('modal.title')}</h3>
          {plan && (
            <p className="text-sm text-gray-600">
              {plan.title} -{" "}
              {billingInterval === "yearly" ? t('billing.yearly') : t('billing.monthly')} Plan
            </p>
          )}
        </ModalHeader>
        <ModalBody>
          {paymentStatus === "idle" && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{t('modal.totalAmount')}</span>
                  <span className="text-xl font-bold text-[#091413]">
                    {calculateAmount().toLocaleString()} XOF
                  </span>
                </div>
                {billingInterval === "yearly" &&
                  plan?.yearly_discount_percent && (
                    <p className="text-sm text-green-700 mt-1">
                      {t('billing.saveDiscount', { percent: plan.yearly_discount_percent })}
                    </p>
                  )}
              </div>

              <Select
                label={t('modal.provider')}
                placeholder={t('modal.selectProvider')}
                value={provider}
                variant="bordered"
                onChange={(e) => setProvider(e.target.value)}
                isRequired
                classNames={{
                  trigger: "border-gray-300 bg-white hover:border-[#091413]",
                  label: "text-gray-700",
                  value: "text-gray-900"
                }}
              >
                {mobileProviders.map((prov) => (
                  <SelectItem key={prov.key}>{prov.label}</SelectItem>
                ))}
              </Select>

              <Input
                label={t('modal.phoneNumber')}
                placeholder={t('modal.enterPhone')}
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(formatPhoneNumber(e.target.value))
                }
                variant="bordered"
                isRequired
                description={t('modal.phoneDescription')}
                classNames={{
                  input: "text-gray-900",
                  label: "text-gray-700",
                  inputWrapper: "border-gray-300 bg-white hover:border-[#091413] focus-within:border-[#091413]",
                  description: "text-gray-600"
                }}
              />

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>{t('modal.note')}</strong> {t('modal.instructions')}
                </p>
              </div>
            </div>
          )}

          {paymentStatus === "processing" && (
            <div className="text-center py-8">
              <Spinner size="lg" color="success" />
              <p className="mt-4 text-lg font-medium text-gray-900">
                {t('status.initializing')}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {t('status.initializingDescription')}
              </p>
            </div>
          )}

          {paymentStatus === "initialized" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-blue-600">
                {t('status.initialized')}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {t('status.initializedDescription')}
              </p>
              <div className="bg-blue-50 p-3 rounded-lg mt-4 border border-blue-200">
                <p className="text-sm text-blue-800">
                  {t('status.initializedInstructions')}
                </p>
              </div>
            </div>
          )}

          {paymentStatus === "waiting" && (
            <div className="text-center py-8">
              <Spinner size="lg" color="warning" />
              <p className="mt-4 text-lg font-medium text-orange-600">
                {t('status.waiting')}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {t('status.waitingDescription')}
              </p>
              <div className="bg-orange-50 p-3 rounded-lg mt-4 border border-orange-200">
                <p className="text-sm text-orange-800">
                  {t('status.waitingInstructions')}
                </p>
              </div>
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-green-600">
                {t('status.confirmed')}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {t('status.confirmedDescription')}
              </p>
            </div>
          )}

          {paymentStatus === "error" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-red-600">{t('status.failed')}</p>
              <p className="text-sm text-gray-600 mt-2">{errorMessage}</p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {paymentStatus === "idle" && (
            <>
              <Button color="danger" variant="light" onPress={onClose}>
                {t('modal.cancel')}
              </Button>
              <Button
                className="bg-[#091413] text-white hover:bg-[#15803d]"
                onPress={handlePayment}
                isDisabled={!phoneNumber || !provider || loading}
                isLoading={loading}
              >
                {t('modal.initialize')}
              </Button>
            </>
          )}
          {(paymentStatus === "initialized" || paymentStatus === "waiting") && (
            <Button variant="light" onPress={onClose}>
              {t('modal.close')}
            </Button>
          )}
          {paymentStatus === "error" && (
            <>
              <Button variant="light" onPress={onClose}>
                {t('modal.close')}
              </Button>
              <Button
                className="bg-[#091413] text-white hover:bg-[#15803d]"
                onPress={() => {
                  setPaymentStatus("idle");
                  setErrorMessage("");
                }}
              >
                {t('modal.tryAgain')}
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
