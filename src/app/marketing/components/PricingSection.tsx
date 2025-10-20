'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslationNamespace } from '@/contexts/TranslationContext';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { fadeInUp, staggerContainer, staggerItem } from '@/utils/animations';
import { calculateYearlyPrice, formatPrice, getDiscountLabel } from '@/utils/pricing';
import { Spinner } from '@heroui/react';
import { useAuth } from '@/contexts/AuthContext';

export default function PricingSection() {
  const router = useRouter();
  const { t } = useTranslationNamespace('marketing.pricing');
  const { user, loading: authLoading } = useAuth();
  const { plans, loading } = useSubscriptionContext();
  const [isAnnual, setIsAnnual] = useState(false);

  const handlePlanSelect = () => {
    if (user) {
      router.push('/dashboard/subscription');
    } else {
      router.push('/register');
    }
  };

  // Show loading state or fallback plans
  if (loading || plans.length === 0) {
    return (
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('title')}
            </h2>
            {
              loading ? (
                <Spinner color='warning' size="lg" className='mt-6'/>
              ) : (
                <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                  Pricing plans will be available soon.
                </p>
              )
            }
           
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="text-center"
        >
          {/* Section header */}
          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            {t('title')}
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto"
          >
            {t('subtitle')}
          </motion.p>

          {/* Annual discount banner */}
          <motion.div
            variants={fadeInUp}
            className="mb-8"
          >
            <div className="inline-flex items-center bg-green-100 text-green-800 px-6 py-3 rounded-full">
              <span className="font-semibold">{t('annualDiscount')}</span>
            </div>
          </motion.div>

          {/* Pricing toggle */}
          <motion.div
            variants={fadeInUp}
            className="mb-12"
          >
            <div className="flex items-center justify-center space-x-4">
              <span className={`text-lg ${!isAnnual ? 'text-white font-semibold' : 'text-gray-400'}`}>
                Mensuel
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAnnual ? 'bg-white' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-[#212121] transition-transform ${
                    isAnnual ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-lg ${isAnnual ? 'text-white font-semibold' : 'text-gray-400'}`}>
                Annuel
              </span>
            </div>
          </motion.div>

          {/* Pricing cards */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                variants={staggerItem}
                className={`relative bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-lg border-2 p-8 ${
                  plan.yearly_discount_percent > 10 ? 'border-green-500/50 scale-105 shadow-green-500/20' : 'border-gray-700'
                }`}
              >
                {plan.yearly_discount_percent > 10 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-green-500 to-green-400 text-black px-4 py-1 rounded-full text-sm font-semibold shadow-lg shadow-green-500/25">
                      Populaire
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {plan.title}
                  </h3>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">
                      {isAnnual 
                        ? formatPrice(calculateYearlyPrice(plan) / 12)
                        : formatPrice(plan.price_monthly)
                      }
                    </span>
                    <span className="text-gray-300 ml-1">
                      /{isAnnual ? 'month' : 'month'}
                    </span>
                    {isAnnual && plan.yearly_discount_percent > 0 && (
                      <div className="mt-2">
                        <span className="text-green-400 text-sm font-semibold">
                          {getDiscountLabel(plan.yearly_discount_percent)} annually
                        </span>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 text-left">
                    {plan.features && plan.features.length > 0 ? plan.features.map((feature, featureIndex: number) => (
                      <li key={featureIndex} className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-300">{feature.feature}</span>
                      </li>
                    )) : (
                      <li className="text-gray-400 text-sm">Features loading...</li>
                    )}
                  </ul>

                  <button
                    onClick={handlePlanSelect}
                    disabled={authLoading}
                    className={`w-full py-3 px-6 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                      plan.yearly_discount_percent > 10
                        ? 'bg-gradient-to-r from-green-500 to-green-400 text-black hover:from-green-400 hover:to-green-300 shadow-lg shadow-green-500/25 hover:shadow-green-400/40'
                        : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600 hover:border-green-500/50'
                    }`}
                  >
                    {authLoading ? 'Loading...' : user ? 'Manage Subscription' : (t('plans.starter.cta') || 'Get Started')}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}