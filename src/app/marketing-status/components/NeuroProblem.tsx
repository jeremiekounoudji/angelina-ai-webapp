'use client';

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, fadeInLeft, fadeInRight } from '@/utils/animations';
import { AlertTriangle, Brain, BatteryWarning } from 'lucide-react';
import { useTranslationNamespace } from '@/contexts/TranslationContext';

export default function NeuroProblem() {
  const { t } = useTranslationNamespace('marketing.statusNeuro');

  return (
    <section className="py-24 bg-gray-950 relative overflow-hidden">
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
            {t('title')} <span className="text-red-400">{t('titleHighlight')}</span>
          </motion.h2>
          <motion.p 
            variants={fadeInUp} 
            className="text-xl text-gray-400 max-w-3xl mx-auto"
          >
            {t('subtitle')}
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            variants={fadeInLeft}
            className="bg-black border border-gray-800 rounded-3xl p-10 hover:border-red-500/30 transition-all duration-300"
          >
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-8">
              <Brain className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">{t('cards.zeigarnik.title')}</h3>
            <p className="text-gray-400 leading-relaxed text-lg">
              {t('cards.zeigarnik.description')}
            </p>
          </motion.div>

          <motion.div 
            variants={fadeInUp}
            className="bg-black border border-gray-800 rounded-3xl p-10 hover:border-orange-500/30 transition-all duration-300"
          >
            <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-8">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">{t('cards.decision.title')}</h3>
            <p className="text-gray-400 leading-relaxed text-lg">
              {t('cards.decision.description')}
            </p>
          </motion.div>

          <motion.div 
            variants={fadeInRight}
            className="bg-black border border-gray-800 rounded-3xl p-10 hover:border-yellow-500/30 transition-all duration-300"
          >
            <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-8">
              <BatteryWarning className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">{t('cards.inconsistency.title')}</h3>
            <p className="text-gray-400 leading-relaxed text-lg">
              {t('cards.inconsistency.description')}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
