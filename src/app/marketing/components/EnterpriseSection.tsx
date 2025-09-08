'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { fadeInUp, staggerContainer, staggerItem } from '@/utils/animations';

export default function EnterpriseSection() {
  const { t } = useTranslation();

  const features = [
    {
      id: 'privacy',
      title: t('enterprise.features.privacy.title'),
      description: t('enterprise.features.privacy.description'),
      icon: '🛡️'
    },
    {
      id: 'compliance',
      title: t('enterprise.features.compliance.title'),
      description: t('enterprise.features.compliance.description'),
      icon: '🌍'
    },
    {
      id: 'trust',
      title: t('enterprise.features.trust.title'),
      description: t('enterprise.features.trust.description'),
      icon: '❤️'
    }
  ];

  return (
    <section className="py-20 text-white">
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
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            {t('enterprise.title')}
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-xl text-gray-300 mb-16 max-w-2xl mx-auto"
          >
            {t('enterprise.subtitle')}
          </motion.p>

          {/* Features */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                variants={staggerItem}
                className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-8 hover:bg-gray-800/40 transition-all duration-300 border border-gray-700 hover:border-green-500/30"
              >
                {/* Icon */}
                <div className="text-6xl mb-6">
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-4">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
