"use client";

import { useState } from "react";
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
import { createClient } from "@/lib/supabase/client";
import { useTranslationNamespace } from "@/contexts/TranslationContext";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  billingInterval: "monthly" | "yearly";
  companyId: string;
  customerEmail: string;
}

const mobileProviders = [
  { key: "mtn_benin", label: "MTN Benin", country: "BJ" },
  { key: "moov_benin", label: "Moov Benin", country: "BJ" },
  { key: "mtn_togo", label: "MTN Togo", country: "TG" },
  { key: "moov_togo", label: "Moov Togo", country: "TG" },
  { key: "mtn_ci", label: "MTN Côte d'Ivoire", country: "CI" },
];

export default function PaymentModal({
  isOpen,
  onClose,
  plan,
  billingInterval,
  companyId,
  customerEmail,
}: PaymentModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [provider, setProvider] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "initialized" | "waiting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [merchantReference, setMerchantReference] = useState("");
  const { refreshUser } = useAuth();
  const supabase = createClient();
  const { t } = useTranslationNamespace('dashboard.payment');

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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment failed");
      }

      if (data.success) {
        setPaymentStatus("initialized");
        setMerchantReference(data.merchant_reference);
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
    const maxAttempts = 60; // 10 minutes with 10-second intervals
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
            window.location.reload(); // Refresh to show updated subscription
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

    // Format based on selected provider's country
    const selectedProvider = mobileProviders.find((p) => p.key === provider);
    if (selectedProvider) {
      switch (selectedProvider.country) {
        case "BJ": // Benin: +229 XX XX XX XX
          return digits.length > 10
            ? `+229 ${digits.slice(-10, -8)} ${digits.slice(
                -8,
                -6
              )} ${digits.slice(-6, -4)} ${digits.slice(-4, -2)} ${digits.slice(
                -2
              )}`
            : digits;
        case "TG": // Togo: +228 XX XX XX XX
          return digits.length > 8
            ? `+228 ${digits.slice(-8, -6)} ${digits.slice(
                -6,
                -4
              )} ${digits.slice(-4, -2)} ${digits.slice(-2)}`
            : digits;
        case "CI": // Côte d'Ivoire: +225 XX XX XX XX XX
          return digits.length > 10
            ? `+225 ${digits.slice(-10, -8)} ${digits.slice(
                -8,
                -6
              )} ${digits.slice(-6, -4)} ${digits.slice(-4, -2)} ${digits.slice(
                -2
              )}`
            : digits;
        default:
          return digits;
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
        base: "bg-background border border-secondary",
        header: "border-b border-secondary",
        footer: "border-t border-secondary"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold text-white">{t('modal.title')}</h3>
          {plan && (
            <p className="text-sm text-gray-50">
              {plan.title} -{" "}
              {billingInterval === "yearly" ? t('billing.yearly') : t('billing.monthly')} Plan
            </p>
          )}
        </ModalHeader>
        <ModalBody>
          {paymentStatus === "idle" && (
            <div className="space-y-4">
              <div className="bg-secondary p-4 rounded-lg border border-secondary">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">{t('modal.totalAmount')}</span>
                  <span className="text-xl font-bold text-primary">
                    {calculateAmount().toLocaleString()} XOF
                  </span>
                </div>
                {billingInterval === "yearly" &&
                  plan?.yearly_discount_percent && (
                    <p className="text-sm text-green-400 mt-1">
                      {t('billing.saveDiscount', { percent: plan.yearly_discount_percent })}
                    </p>
                  )}
              </div>

              <Select
                label={t('modal.provider')}
                placeholder={t('modal.selectProvider')}
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                isRequired
                classNames={{
                  trigger: "border-secondary bg-background",
                  label: "text-gray-50",
                  value: "text-white"
                }}
              >
                {mobileProviders.map((prov) => (
                  <SelectItem key={prov.key} className=" text-gray-800">{prov.label}</SelectItem>
                ))}
              </Select>

              <Input
                label={t('modal.phoneNumber')}
                placeholder={t('modal.enterPhone')}
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(formatPhoneNumber(e.target.value))
                }
                isRequired
                description={t('modal.phoneDescription')}
                classNames={{
                  input: "text-white",
                  label: "text-gray-50",
                  inputWrapper: "border-secondary bg-background",
                  description: "text-gray-50"
                }}
              />

              <div className="bg-secondary p-3 rounded-lg border border-secondary">
                <p className="text-sm text-blue-300">
                  <strong>{t('modal.note')}</strong> {t('modal.instructions')}
                </p>
              </div>
            </div>
          )}

          {paymentStatus === "processing" && (
            <div className="text-center py-8">
              <Spinner size="lg" color="primary" />
              <p className="mt-4 text-lg font-medium text-white">
                {t('status.initializing')}
              </p>
              <p className="text-sm text-gray-50 mt-2">
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
              <p className="text-sm text-gray-50 mt-2">
                {t('status.initializedDescription')}
              </p>
              <div className="bg-secondary p-3 rounded-lg mt-4 border border-secondary">
                <p className="text-sm text-blue-300">
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
              <p className="text-sm text-gray-50 mt-2">
                {t('status.waitingDescription')}
              </p>
              <div className="bg-secondary p-3 rounded-lg mt-4 border border-secondary">
                <p className="text-sm text-orange-300">
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
              <p className="text-sm text-gray-50 mt-2">
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
              <p className="text-sm text-gray-50 mt-2">{errorMessage}</p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {paymentStatus === "idle" && (
            <>
              <Button variant="light" onPress={onClose}>
                {t('modal.cancel')}
              </Button>
              <Button
                color="primary"
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
                color="primary"
                onPress={() => {
                  setPaymentStatus("idle");
                  setErrorMessage("");
                  setMerchantReference("");
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
