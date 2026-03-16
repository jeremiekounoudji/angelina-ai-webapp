'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody, Chip, Spinner } from '@heroui/react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { useTranslationNamespace } from '@/contexts/TranslationContext';
import { SubscriptionPlan, SubscriptionFeature } from '@/types/database';
import { calculateYearlyPrice, formatPrice, getDiscountLabel } from '@/utils/pricing';
import { fadeInUp, staggerContainer } from '@/utils/animations';

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  const { plans, loading } = useSubscriptionContext();
  const { t, locale } = useTranslationNamespace('dashboard.subscription');
  const router = useRouter();

  const getPlanTitle = (plan: SubscriptionPlan) =>
    locale === 'fr' && plan.title_fr ? plan.title_fr : plan.title;

  const getPlanDescription = (plan: SubscriptionPlan) =>
    locale === 'fr' && plan.description_fr ? plan.description_fr : plan.description;

  const getFeatureText = (feature: SubscriptionFeature) =>
    locale === 'fr' && feature.feature_fr ? feature.feature_fr : feature.feature;

  return (
    <section id="pricing" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          {/* Heading */}
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('plans.choose')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('plans.description')}
            </p>
          </motion.div>

          {/* Billing toggle */}
          <motion.div variants={fadeInUp} className="flex items-center justify-center gap-4 mb-10">
            <span className={`text-sm ${!isAnnual ? 'text-white font-semibold' : 'text-gray-400'}`}>
              {t('billing.monthly')}
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAnnual ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-white font-semibold' : 'text-gray-400'}`}>
              {t('billing.annual')}
            </span>
            {isAnnual && (
              <Chip color="success" size="sm" variant="flat">
                {t('billing.savePercent')}
              </Chip>
            )}
          </motion.div>

          {/* Plans */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" color="success" />
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {plans.map((plan) => {
                const isPopular = plan.yearly_discount_percent > 10;
                return (
                  <motion.div key={plan.id} variants={fadeInUp}>
                    <Card
                      className={`relative h-full ${
                        isPopular
                          ? 'border-2 border-green-500 bg-green-900/20'
                          : 'border border-white/10 bg-white/5'
                      } backdrop-blur-sm`}
                    >
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Chip className="bg-green-500 text-black font-semibold" size="sm">
                            {t('plans.mostPopular')}
                          </Chip>
                        </div>
                      )}

                      <CardHeader className="text-center pb-2 pt-6">
                        <div className="w-full">
                          <h3 className="text-2xl font-bold text-white">{getPlanTitle(plan)}</h3>
                          <p className="text-gray-400 mt-1 text-sm">{getPlanDescription(plan)}</p>
                          <div className="mt-4">
                            <span className="text-4xl font-bold text-white">
                              {isAnnual
                                ? formatPrice(calculateYearlyPrice(plan) / 12, plan.currency || 'USD')
                                : formatPrice(plan.price_monthly, plan.currency || 'USD')}
                            </span>
                            <span className="text-gray-400">{t('plans.perMonth')}</span>
                            {isAnnual && plan.yearly_discount_percent > 0 && (
                              <div className="mt-1">
                                <span className="text-green-400 text-sm font-semibold">
                                  {getDiscountLabel(plan.yearly_discount_percent)} {t('plans.annually')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardBody className="pt-2">
                        <ul className="space-y-3 mb-6">
                          {plan.features?.map((feature, i) => (
                            <li key={i} className="flex items-center gap-3">
                              <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                              <span className="text-sm text-gray-300">{getFeatureText(feature)}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => router.push('/login')}
                          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            isPopular
                              ? 'bg-green-500 text-black hover:bg-green-400'
                              : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                          }`}
                        >
                          {t('plans.select')}
                        </button>
                      </CardBody>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
