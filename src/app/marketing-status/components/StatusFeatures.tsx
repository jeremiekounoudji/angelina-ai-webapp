'use client';

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/utils/animations';
import { CalendarDays, Repeat, Image as ImageIcon, Zap } from 'lucide-react';
import { useTranslationNamespace } from '@/contexts/TranslationContext';

const featureKeys = [
  {
    key: "precision",
    icon: CalendarDays,
    color: "text-blue-400",
    bg: "bg-blue-400/10"
  },
  {
    key: "recurring",
    icon: Repeat,
    color: "text-purple-400",
    bg: "bg-purple-400/10"
  },
  {
    key: "media",
    icon: ImageIcon,
    color: "text-pink-400",
    bg: "bg-pink-400/10"
  },
  {
    key: "background",
    icon: Zap,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10"
  }
];

export default function StatusFeatures() {
  const { t } = useTranslationNamespace('marketing.statusFeatures');

  return (
    <section className="py-24 bg-black relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={fadeInUp} 
            className="text-3xl md:text-5xl font-bold text-white mb-6"
          >
            {t('title')} <span className="text-green-400">{t('titleHighlight')}</span>
          </motion.h2>
          <motion.p 
            variants={fadeInUp} 
            className="text-xl text-gray-400 max-w-3xl mx-auto"
          >
            {t('subtitle')}
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {featureKeys.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="bg-gray-900 border border-gray-800 rounded-3xl p-10 hover:border-green-500/30 hover:bg-gray-900/80 transition-all duration-300 group"
              >
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${feature.bg}`}>
                    <Icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors">
                      {t(`items.${feature.key}.title`)}
                    </h3>
                    <p className="text-gray-400 leading-relaxed text-lg">
                      {t(`items.${feature.key}.description`)}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
