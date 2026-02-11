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
import { useAuth, } from "@/contexts/AuthContext";
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
  const { company,user } = useAuth();
  const { plans, loading, error } = useSubscriptionContext();
  const { usage, loading: tokenLoading } = useTokenUsage(company?.id);
  const { t } = useTranslationNamespace("dashboard.subscription");

  const currentPlan =
    plans.find((plan) => plan.id.toString() === company?.subscription_id) ||
    null;

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    console.log("Selected plan:", plan);
    setIsOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="success" />
          <p className="mt-4 text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <Card className="border-red-200 bg-red-50">
          <CardBody className="text-center py-8">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              {t("error")}
            </h3>
            <p className="text-red-600">{error}</p>
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
    <div className="p-6 bg-white min-h-screen">
      {/* Current Subscription Status */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t("currentPlan.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan Card */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardBody className="p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCardIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t("currentPlan.plan")}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentPlan
                      ? currentPlan.title
                      : t("currentPlan.noActivePlan")}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Monthly Cost Card */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardBody className="p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <BanknotesIcon className="w-6 h-6 text-[#328E6E]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('billing.monthlyCost')}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentPlan ? `$${currentPlan.price_monthly}` : "$0"}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Status Card */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardBody className="p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('billing.status')}</p>
                  <Chip
                    size="sm"
                    color={getStatusColor(company?.subscription_status)}
                    variant="flat"
                    className="capitalize"
                  >
                    {company?.subscription_status || "inactive"}
                  </Chip>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {company?.subscription_status === "trial" && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              {t('billing.trialMessage')}
            </p>
          </div>
        )}
      </div>

      {/* Token Usage */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('tokens.usage')}</h2>
        {tokenLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" color="success" />
            <span className="ml-2 text-gray-600">{t('tokens.loadingData')}</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {/* Tokens Used */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardBody className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-lg font-bold">T</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('tokens.used')}</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {usage?.tokens_used?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Tokens Remaining */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardBody className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-[#328E6E] text-lg font-bold">R</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('tokens.remaining')}</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {usage?.tokens_remaining?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Monthly Allowance */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardBody className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-lg font-bold">A</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('tokens.allowance')}</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {currentPlan?.token_allowance_monthly?.toLocaleString() ||
                          0}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Tokens Purchased */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardBody className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 text-lg font-bold">P</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('tokens.purchased')}</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {usage?.tokens_purchased?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {usage && currentPlan && (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardBody className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">{t('tokens.usageProgress')}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round(
                        (usage.tokens_used /
                          (currentPlan.token_allowance_monthly +
                            usage.tokens_purchased)) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-[#328E6E] h-3 rounded-full transition-all duration-300"
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
                    <div className="mt-4 flex justify-end">
                      <Button
                        className="bg-[#328E6E] text-white hover:bg-[#15803d]"
                        size="sm"
                        onPress={() => setIsBuyTokensOpen(true)}
                      >
                        {t('tokens.buyMore')}
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Available Plans */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {t('plans.choose')}
        </h2>
        <p className="text-gray-600 mb-4">
          {t('plans.description')}
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <span
            className={`text-sm ${
              !isAnnual ? "text-gray-900 font-semibold" : "text-gray-500"
            }`}
          >
            {t('billing.monthly')}
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isAnnual ? "bg-[#328E6E]" : "bg-gray-300"
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
              isAnnual ? "text-gray-900 font-semibold" : "text-gray-500"
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
                ? "border-2 border-[#328E6E] bg-green-50"
                : "border border-gray-200 bg-white"
            } shadow-sm hover:shadow-md transition-shadow`}
          >
            {plan.yearly_discount_percent > 10 && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Chip className="bg-[#328E6E] text-white" size="sm">
                  {t('plans.mostPopular')}
                </Chip>
              </div>
            )}

            <CardHeader className="text-center pb-2">
              <div className="w-full">
                <h3 className="text-2xl font-bold text-gray-900">
                  {plan.title}
                </h3>
                <p className="text-gray-600 mt-1">
                  {plan.description}
                </p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {isAnnual
                      ? formatPrice(calculateYearlyPrice(plan) / 12)
                      : formatPrice(plan.price_monthly)}
                  </span>
                  <span className="text-gray-600">{t('plans.perMonth')}</span>
                  {isAnnual && plan.yearly_discount_percent > 0 && (
                    <div className="mt-1">
                      <span className="text-[#328E6E] text-sm font-semibold">
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
                    <CheckIcon className="w-5 h-5 text-[#328E6E] flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                      {feature.feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full text-white ${
                  currentPlan?.id === plan.id
                    ? "bg-gray-400"
                    : "bg-[#328E6E] hover:bg-[#15803d]"
                }`}
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

      <PaymentModal
        isOpen={isOpen}
        customerEmail={user?.email || ""}
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
