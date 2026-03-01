'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { fadeInUp, staggerContainer } from '@/utils/animations';
import { useTranslationNamespace } from '@/contexts/TranslationContext';

export default function HeroStatus() {
  const router = useRouter();
  const { t } = useTranslationNamespace('marketing.statusHero');

  const handleCTAClick = () => {
    router.push('/register');
  };

  return (
    <section className="relative pt-32 pb-16 min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Blur Dark Cover */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2000&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="text-center"
        >
          {/* Main heading */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight max-w-5xl mx-auto"
          >
            {t('title')} 
            <span className="text-green-400 block mt-2">{t('titleHighlight')}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed"
          >
            {t('subtitle')}
          </motion.p>

          {/* CTA Button */}
          <motion.div
            variants={fadeInUp}
            className="mb-16"
          >
            <button 
              onClick={handleCTAClick}
              className="bg-gradient-to-r from-green-500 to-green-400 text-black px-10 py-5 rounded-full text-xl font-bold hover:from-green-400 hover:to-green-300 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-green-500/25"
            >
              {t('cta')}
            </button>
            <p className="text-sm text-gray-400 mt-4">{t('trialText')}</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
