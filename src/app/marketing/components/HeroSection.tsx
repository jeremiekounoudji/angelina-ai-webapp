'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useTypingAnimation } from '@/hooks/useTypingAnimation';
import { fadeInUp, staggerContainer, staggerItem } from '@/utils/animations';

export default function HeroSection() {
  const { t } = useTranslation();
  const animatedFunctions = t('hero.animatedFunctions') as string[];
  const animatedText = useTypingAnimation({
    words: animatedFunctions,
    typingSpeed: 150,
    deletingSpeed: 100,
    pauseTime: 2000,
    loop: true
  });

  return (
    <section id="home" className="pt-20 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="text-center"
        >
          {/* Main heading with animated text */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-6xl lg:text-7xl lg:m-5 font-bold text-white mb-6 leading-tight min-h-[6rem] flex items-center justify-center flex-wrap"
          >
            <span className="text-white">
              {t('hero.title')}{' '}
            </span>
            <span className="text-green-400 ml-2 border-r-2 border-green-400 animate-pulse">
              {animatedText}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* CTA Button */}
          <motion.div
            variants={fadeInUp}
            className="mb-12"
          >
            <button className="bg-gradient-to-r from-green-500 to-green-400 text-black px-8 py-4 rounded-full text-lg font-semibold hover:from-green-400 hover:to-green-300 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25 hover:shadow-green-400/40">
              {t('hero.cta')}
            </button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            variants={staggerContainer}
            className="flex flex-col md:flex-row items-center justify-center gap-8"
          >
            {/* Rating */}
            <motion.div
              variants={staggerItem}
              className="flex items-center gap-2"
            >
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-lg font-semibold text-white">
                {t('hero.rating')}
              </span>
            </motion.div>

            {/* User count */}
            <motion.div
              variants={staggerItem}
              className="text-lg text-gray-300"
            >
              {t('hero.userCount')}
            </motion.div>

            {/* User avatars */}
            <motion.div
              variants={staggerItem}
              className="flex -space-x-2"
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center text-white font-semibold text-sm"
                >
                  {i}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}