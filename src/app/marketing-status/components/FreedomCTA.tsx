'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { fadeInUp, staggerContainer } from '@/utils/animations';
import { useTranslationNamespace } from '@/contexts/TranslationContext';

export default function FreedomCTA() {
  const router = useRouter();
  const { t } = useTranslationNamespace('marketing.statusCTA');

  const handleCTAClick = () => {
    router.push('/register');
  };

  return (
    <section className="py-24 bg-gradient-to-br from-green-900 via-black to-black relative border-t border-green-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.h2 
            variants={fadeInUp} 
            className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight"
          >
            {t('title')} <span className="text-green-400">{t('titleHighlight')}</span> {t('titleEnd')}
          </motion.h2>
          <motion.p 
            variants={fadeInUp} 
            className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed"
          >
            {t('subtitle')}
          </motion.p>
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <button 
              onClick={handleCTAClick}
              className="w-full sm:w-auto bg-green-500 text-black px-12 py-5 rounded-full text-xl font-bold hover:bg-green-400 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-green-500/30"
            >
              {t('cta')}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
