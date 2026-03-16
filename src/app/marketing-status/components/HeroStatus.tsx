'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { fadeInUp, staggerContainer } from '@/utils/animations';
import { useTranslationNamespace } from '@/contexts/TranslationContext';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';

export default function HeroStatus() {
  const router = useRouter();
  const { t } = useTranslationNamespace('marketing.statusHero');

  const handleCTAClick = () => {
    router.push('/register');
  };

  return (
    <section className="relative pt-32 pb-20 min-h-screen flex items-center overflow-hidden">
      {/* Background — person using phone, business context */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2000&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/75 to-black/60"></div>
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 right-20 w-24 h-24 border border-green-500/30 rounded-3xl backdrop-blur-sm"
        animate={{ 
          rotate: [0, 360],
          y: [0, -20, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      />
      <motion.div
        className="absolute bottom-32 left-20 w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full backdrop-blur-sm"
        animate={{ 
          x: [0, 30, 0],
          opacity: [0.3, 0.8, 0.3]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#328E6E]/10 border border-[#328E6E]/30 rounded-full text-[#328E6E] text-sm font-medium mb-8 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Status Automation</span>
            <Zap className="w-4 h-4" />
          </motion.div>

          {/* Main heading */}
          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight max-w-4xl mx-auto"
          >
            {t('title')} 
            <span className="block mt-2 text-[#328E6E]">
              {t('titleHighlight')}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            {t('subtitle')}
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeInUp} className="mb-16">
            <motion.button 
              onClick={handleCTAClick}
              className="group inline-flex items-center gap-3 bg-[#328E6E] hover:bg-[#267a5e] text-white px-10 py-5 rounded-2xl text-lg font-bold transition-all duration-300 shadow-2xl shadow-green-900/40 hover:shadow-green-800/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{t('cta')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {[
              { number: "10+", label: "Hours Saved Monthly" },
              { number: "99.9%", label: "Uptime Guarantee" },
              { number: "5min", label: "Setup Time" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-[#328E6E]/40 transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-[#328E6E] mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-5"></div>
    </section>
  );
}
