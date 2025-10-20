"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Spinner,
} from "@heroui/react";
import {
  CheckIcon,
  CreditCardIcon,
  CalendarIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
import PaymentModal from "./components/PaymentModal";
import BuyTokensModal from "./components/BuyTokensModal";
import PaymentHistory from "../components/PaymentHistory";
import { SubscriptionPlan } from "@/types/database";
import {
  calculateYearlyPrice,
  formatPrice,
  getDiscountLabel,
} from "@/utils/pricing";
import { useTokenUsage } from "@/hooks/useTokenUsage";
import { useTranslationNamespace } from "@/contexts/TranslationContext";

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isBuyTokensOpen, setIsBuyTokensOpen] = useState<boolean>(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const { company, user } = useAuth();
  const { plans, payments, loading, error } = useSubscriptionContext();
  const { usage, loading: tokenLoading } = useTokenUsage(company?.id);
  const { t } = useTranslationNamespace("dashboard.subscription");
  // const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const currentPlan =
    plans.find((plan) => plan.id.toString() === company?.subscription_id) ||
    null;

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    console.log("Selected plan:", plan);
    // onOpen();
    setIsOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-50">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-danger-200 bg-danger-50">
          <CardBody className="text-center py-8">
            <ExclamationTriangleIcon className="w-12 h-12 text-danger-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-danger-700 mb-2">
              {t("error")}
            </h3>
            <p className="text-danger-600">{error}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "success";
      case "trial":
        return "warning";
      case "inactive":
        return "default";
      case "cancelled":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Current Subscription Status */}
      <Card className="mb-8 bg-background border border-secondary shadow-lg shadow-secondary/20">
        <CardHeader>
          <h2 className="text-xl font-semibold text-white">
            {t("currentPlan.title")}
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <CreditCardIcon className="w-8 h-8 text-gray-100" />
              <div>
                <p className="text-sm text-gray-50">{t("currentPlan.plan")}</p>
                <p className="font-medium text-white">
                  {currentPlan
                    ? currentPlan.title
                    : t("currentPlan.noActivePlan")}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-gray-100">
              <BanknotesIcon className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm ">{t('billing.monthlyCost')}</p>
                <p className="font-medium">
                  {currentPlan ? `$${currentPlan.price_monthly}` : "$0"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-gray-100">
              <CalendarIcon className="w-8 h-8 " />
              <div>
                <p className="text-sm ">{t('billing.status')}</p>
                <Chip
                  size="sm"
                  color={getStatusColor(company?.subscription_status)}
                  variant="flat"
                  className="capitalize text-gray-100"
                >
                  {company?.subscription_status || "inactive"}
                </Chip>
              </div>
            </div>
          </div>

          {company?.subscription_status === "trial" && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-sm">
                {t('billing.trialMessage')}
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Token Usage */}
      <Card className="mb-8 bg-background border border-secondary shadow-lg shadow-secondary/20">
        <CardHeader>
          <h2 className="text-xl text-white font-semibold">{t('tokens.usage')}</h2>
        </CardHeader>
        <CardBody>
          {tokenLoading ? (
            <div className="flex items-center justify-center py-8 text-gray-200">
              <Spinner size="md" />
              <span className="ml-2">{t('tokens.loadingData')}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-bold">T</span>
                </div>
                <div>
                  <p className="text-sm text-gray-100">{t('tokens.used')}</p>
                  <p className="font-medium text-gray-50">
                    {usage?.tokens_used?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">R</span>
                </div>
                <div>
                  <p className="text-sm text-gray-100">{t('tokens.remaining')}</p>
                  <p className="font-medium text-gray-50">
                    {usage?.tokens_remaining?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm font-bold">A</span>
                </div>
                <div>
                  <p className="text-sm text-gray-100">{t('tokens.allowance')}</p>
                  <p className="font-medium text-gray-50">
                    {currentPlan?.token_allowance_monthly?.toLocaleString() ||
                      0}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-sm font-bold">P</span>
                </div>
                <div>
                  <p className="text-sm text-gray-100 ">{t('tokens.purchased')}</p>
                  <p className="font-medium text-gray-50">
                    {usage?.tokens_purchased?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>
          )}

          {usage && currentPlan && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-100">{t('tokens.usageProgress')}</span>
                <span className="text-sm text-gray-500">
                  {Math.round(
                    (usage.tokens_used /
                      (currentPlan.token_allowance_monthly +
                        usage.tokens_purchased)) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      (usage.tokens_used /
                        (currentPlan.token_allowance_monthly +
                          usage.tokens_purchased)) *
                        100
                    )}%`,
                  }}
                ></div>
              </div>

              {currentPlan.can_buy_extra_tokens && (
                <div className="mt-4 flex justify-end text-gray-100">
                  <Button
                    color="primary"
                    variant="bordered"
                    size="sm"
                    onPress={() => setIsBuyTokensOpen(true)}
                  >
                    {t('tokens.buyMore')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Available Plans */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-50 mb-2">
          {t('plans.choose')}
        </h2>
        <p className="text-gray-200 mb-4">
          {t('plans.description')}
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <span
            className={`text-sm ${
              !isAnnual ? "text-gray-100 font-semibold" : "text-gray-300"
            }`}
          >
            {t('billing.monthly')}
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isAnnual ? "bg-secondary" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAnnual ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span
            className={`text-sm ${
              isAnnual ? "text-gray-50 font-semibold" : "text-gray-100"
            }`}
          >
            {t('billing.annual')}
          </span>
          {isAnnual && (
            <Chip color="success" size="sm" variant="flat">
              {t('billing.savePercent')}
            </Chip>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${
              currentPlan?.id === plan.id
                ? "border-2 border-secondary/50 "
                : "border-1 border-secondary/10 "
            }    bg-backgroung shadow-lg`}
          >
            {plan.yearly_discount_percent > 10 && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Chip color="primary" size="sm">
                  {t('plans.mostPopular')}
                </Chip>
              </div>
            )}

            <CardHeader className="text-center pb-2">
              <div>
                <h3
                  className={`${
                    currentPlan?.id === plan.id
                      ? "text-gray-100"
                      : "text-gray-900"
                  } text-3xl font-bold `}
                >
                  {plan.title}
                </h3>
                <p
                  className={`${
                    currentPlan?.id === plan.id
                      ? "text-gray-200"
                      : "text-gray-200"
                  }  font-bold `}
                >
                  {plan.description}
                </p>
                <div className="mt-4">
                  <span
                    className={`${
                      currentPlan?.id === plan.id
                        ? "text-gray-100"
                        : "text-gray-50"
                    } text-3xl font-bold `}
                  >
                    {isAnnual
                      ? formatPrice(calculateYearlyPrice(plan) / 12)
                      : formatPrice(plan.price_monthly)}
                  </span>
                  <span className="text-gray-600">{t('plans.perMonth')}</span>
                  {isAnnual && plan.yearly_discount_percent > 0 && (
                    <div className="mt-1">
                      <span className="text-green-600 text-sm font-semibold">
                        {getDiscountLabel(plan.yearly_discount_percent)}{" "}
                        {t('plans.annually')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardBody className="pt-2">
              <ul className="space-y-3 mb-6">
                {plan.features?.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span
                      className={`text-sm  ${
                        currentPlan?.id === plan.id
                          ? "text-gray-100"
                          : "text-gray-700"
                      }`}
                    >
                      {feature.feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={currentPlan?.id === plan.id ? "solid" : "solid"}
                className={` w-full text-white ${
                  currentPlan?.id === plan.id
                    ? "bg-secondary/30"
                    : "bg-secondary"
                } `}
                onPress={() => handleSelectPlan(plan)}
                isDisabled={Boolean(currentPlan?.id === plan.id)}
              >
                {currentPlan?.id === plan.id ? t('plans.current') : t('plans.select')}
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Payment History */}
      <PaymentHistory />

      {/* Billing Information
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Billing Information</h3>
        </CardHeader>
        <CardBody>
          <div className="text-center py-8">
            <CreditCardIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No payment method on file
            </h4>
            <p className="text-gray-600 mb-4">
              Add a payment method to manage your subscription and billing.
            </p>
            <Button color="primary" variant="bordered">
              Add Payment Method
            </Button>
          </div>
        </CardBody>
      </Card> */}

      <PaymentModal
        isOpen={isOpen}
        customerEmail={user?.email || ""}
        // onOpenChange={onOpenChange}
        onClose={() => {
          setSelectedPlan(null);
          setIsOpen(false);
        }}
        plan={selectedPlan}
        billingInterval={isAnnual ? "yearly" : "monthly"}
        companyId={company?.id || ""}
      />

      <BuyTokensModal
        isOpen={isBuyTokensOpen}
        onClose={() => setIsBuyTokensOpen(false)}
        companyId={company?.id || ""}
        onSuccess={() => {
          // Refresh token usage data
          window.location.reload();
        }}
      />
    </div>
  );
}
