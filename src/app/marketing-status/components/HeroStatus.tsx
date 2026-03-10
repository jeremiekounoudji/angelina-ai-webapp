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
      {/* Enhanced Background with Multiple Layers */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2000&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-black/70 backdrop-blur-sm"></div>
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-medium mb-8 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Status Automation</span>
            <Zap className="w-4 h-4" />
          </motion.div>

          {/* Main heading with enhanced typography */}
          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-[0.9] max-w-6xl mx-auto"
          >
            {t('title')} 
            <span className="block mt-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 animate-pulse">
              {t('titleHighlight')}
            </span>
          </motion.h1>

          {/* Enhanced subtitle */}
          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl lg:text-3xl text-gray-300 mb-12 max-w-5xl mx-auto leading-relaxed font-light"
          >
            {t('subtitle')}
          </motion.p>

          {/* Enhanced CTA Section */}
          <motion.div
            variants={fadeInUp}
            className="mb-16 space-y-6"
          >
            <motion.button 
              onClick={handleCTAClick}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-blue-500 text-white px-12 py-6 rounded-2xl text-xl font-bold hover:from-green-400 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-green-500/25 hover:shadow-green-500/40"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{t('cta')}</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              
              {/* Animated border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"></div>
            </motion.button>
            
            <motion.p 
              variants={fadeInUp}
              className="text-sm text-gray-400 font-medium"
            >
              {t('trialText')}
            </motion.p>
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
                className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-green-500/30 transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
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
