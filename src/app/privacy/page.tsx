'use client';

import { motion } from 'framer-motion';
import Header from '@/app/marketing/components/Header';
import { useTranslationNamespace } from '@/contexts/TranslationContext';
import { fadeIn, fadeInUp } from '@/utils/animations';

export default function PrivacyPage() {
  const { t } = useTranslationNamespace('marketing.legal.privacy');

  const sections = [
    'intro',
    'dataCollection',
    'dataUsage',
    'dataSecurity',
    'userRights',
    'contact'
  ];

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('title')}
            </h1>
            <p className="text-sm text-gray-500">
              {t('lastUpdated')}
            </p>
          </motion.div>

          {/* Content Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.section
                key={section}
                initial="initial"
                animate="animate"
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/50 rounded-lg p-6 border border-gray-800"
              >
                <h2 className="text-2xl font-semibold text-white mb-4">
                  {t(`sections.${section}.title`)}
                </h2>
                <p className="text-gray-400 leading-relaxed">
                  {t(`sections.${section}.content`)}
                </p>
              </motion.section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
