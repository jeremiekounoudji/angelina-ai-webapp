"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  ArrowRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
import PaymentModal from "../dashboard/subscription/components/PaymentModal";
import { SubscriptionPlan, SubscriptionFeature } from "@/types/database";
import {
  calculateYearlyPrice,
  formatPrice,
  getDiscountLabel,
} from "@/utils/pricing";
import { useTranslationNamespace } from "@/contexts/TranslationContext";

export default function PlanListPage() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const router = useRouter();
  const { company, user, loading: authLoading, refreshUser } = useAuth();
  const { plans, loading, error } = useSubscriptionContext();
  const { t, locale } = useTranslationNamespace("dashboard.subscription");
  const { t: tCommon } = useTranslationNamespace("common");

  // After registration the company may not be in context yet — refresh once on mount
  useEffect(() => {
    if (user && !company && !authLoading) {
      refreshUser();
    }
  }, [user, company, authLoading, refreshUser]);

  const getPlanTitle = (plan: SubscriptionPlan) =>
    locale === "fr" && plan.title_fr ? plan.title_fr : plan.title;

  const getPlanDescription = (plan: SubscriptionPlan) =>
    locale === "fr" && plan.description_fr ? plan.description_fr : plan.description;

  const getFeatureText = (feature: SubscriptionFeature) =>
    locale === "fr" && feature.feature_fr ? feature.feature_fr : feature.feature;

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!company?.id) return; // guard — shouldn't happen after loading
    setSelectedPlan(plan);
    setIsOpen(true);
  };

  const handleSkip = () => router.push("/dashboard");

  const bgImage = "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')";

  // Wait for both plans and company to be ready
  if (loading || authLoading || (user && !company)) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: bgImage }} />
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative z-10 text-center">
          <Spinner size="lg" color="success" />
          <p className="mt-4 text-gray-200">{tCommon("loading.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center relative p-6">
        <div className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: bgImage }} />
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <Card className="relative z-10 border-red-200 bg-red-50 max-w-md">
          <CardBody className="text-center py-8">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">{t("error")}</h3>
            <p className="text-red-600">{error}</p>
            <Button className="mt-4 bg-red-600 text-white" onPress={handleSkip}>
              {tCommon("planList.errorGoToDashboard")}
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background */}
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: bgImage }} />
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {tCommon("planList.title")}
          </h1>
          <p className="text-gray-200 text-lg mb-4">
            {tCommon("planList.subtitle")}
          </p>
          <Button
            variant="light"
            className="text-gray-200 hover:text-white"
            endContent={<ArrowRightIcon className="w-4 h-4" />}
            onPress={handleSkip}
          >
            {tCommon("planList.skipButton")}
          </Button>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <span className={`text-sm ${!isAnnual ? "text-white font-semibold" : "text-gray-300"}`}>
            {t("billing.monthly")}
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isAnnual ? "bg-[#328E6E]" : "bg-gray-500"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAnnual ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className={`text-sm ${isAnnual ? "text-white font-semibold" : "text-gray-300"}`}>
            {t("billing.annual")}
          </span>
          {isAnnual && (
            <Chip color="success" size="sm" variant="flat">
              {t("billing.savePercent")}
            </Chip>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.is_popular
                  ? "border-2 border-[#328E6E] bg-white shadow-xl"
                  : "border border-gray-200 bg-white/95 backdrop-blur-sm"
              } shadow-lg hover:shadow-xl transition-all`}
            >
              {plan.is_popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Chip className="bg-[#328E6E] text-white" size="sm">
                    {t("plans.mostPopular")}
                  </Chip>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <div className="w-full">
                  <h3 className="text-2xl font-bold text-gray-900">{getPlanTitle(plan)}</h3>
                  <p className="text-gray-600 mt-1">{getPlanDescription(plan)}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {isAnnual
                        ? formatPrice(calculateYearlyPrice(plan) / 12, plan.currency || "USD")
                        : formatPrice(plan.price_monthly, plan.currency || "USD")}
                    </span>
                    <span className="text-gray-600">{t("plans.perMonth")}</span>
                    {isAnnual && plan.yearly_discount_percent > 0 && (
                      <div className="mt-1">
                        <span className="text-[#328E6E] text-sm font-semibold">
                          {getDiscountLabel(plan.yearly_discount_percent)} {t("plans.annually")}
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
                      <span className="text-sm text-gray-700">{getFeatureText(feature)}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full text-white ${
                    plan.price_monthly === 0
                      ? "bg-gray-400 hover:bg-gray-500"
                      : "bg-[#328E6E] hover:bg-[#267a5e]"
                  }`}
                  onPress={() =>
                    plan.price_monthly === 0 ? handleSkip() : handleSelectPlan(plan)
                  }
                >
                  {plan.price_monthly === 0
                    ? tCommon("planList.continueWithFree")
                    : t("plans.select")}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Footer Note */}
        <div className="text-center">
          <p className="text-gray-300 text-sm">{tCommon("planList.changeAnytime")}</p>
        </div>
      </div>

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
    </div>
  );
}