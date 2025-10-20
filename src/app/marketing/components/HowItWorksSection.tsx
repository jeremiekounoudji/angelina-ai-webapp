'use client';

import { motion } from 'framer-motion';
import { useTranslationNamespace } from '@/contexts/TranslationContext';
import { fadeInUp, staggerContainer, staggerItem } from '@/utils/animations';

export default function HowItWorksSection() {
  const { t } = useTranslationNamespace('marketing.howItWorks');

  const steps = [
    {
      id: 'configure',
      number: t('steps.configure.number'),
      title: t('steps.configure.title'),
      description: t('steps.configure.description'),
      imageUrl: '/api/placeholder/500/300',
      layout: 'right' // Image on right, content on left
    },
    {
      id: 'generate',
      number: t('steps.generate.number'),
      title: t('steps.generate.title'),
      description: t('steps.generate.description'),
      imageUrl: '/api/placeholder/500/300',
      layout: 'left' // Image on left, content on right
    },
    {
      id: 'deploy',
      number: t('steps.deploy.number'),
      title: t('steps.deploy.title'),
      description: t('steps.deploy.description'),
      imageUrl: '/api/placeholder/500/300',
      layout: 'right' // Image on right, content on left
    },
    {
      id: 'marketplace',
      number: t('steps.marketplace.number'),
      title: t('steps.marketplace.title'),
      description: t('steps.marketplace.description'),
      imageUrl: '/api/placeholder/500/300',
      layout: 'left', // Image on left, content on right
      showCta: true
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          {/* Section header */}
          <motion.div
            variants={fadeInUp}
            className="relative text-center mb-24"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-green-500 p-4 rounded-sm">
                <h2 className="text-4xl md:text-6xl font-bold text-white">
                  {t('title')}
                </h2> 
              </span>
            </div>
        </motion.div>

          {/* Steps */}
          <motion.div
            variants={staggerContainer}
            className="space-y-24"
          >
            {steps.map((step) => (
            <motion.div
              key={step.id}
                variants={staggerItem}
                className={`flex flex-col lg:flex-row items-center gap-12 ${
                  step.layout === 'left' ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
            >
              {/* Content */}
                <div className="flex-1 space-y-4">
                  {/* Step number */}
                  <div className="text-6xl md:text-7xl font-black text-green-500 mb-4">
                      {step.number}
                    </div>
                  
                  {/* Title */}
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    {step.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">
                  {step.description}
                </p>

                  {/* CTA for last step */}
                  {step.showCta && (
                    <div className="pt-8">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-400 text-black px-8 py-4 rounded-full font-medium text-lg shadow-lg shadow-green-500/25 hover:shadow-green-400/40 transition-all duration-300"
                      >
                        {t('cta')}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </motion.button>
                  </div>
                )}
                </div>

                {/* Video/Image */}
                <div className="flex-1">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-gray-700 hover:border-green-500/30 transition-all duration-300"
                  >
                    <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center">
                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer"
                        >
                          <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </motion.div>
                  </div>
                  
                      {/* Video placeholder content */}
                      <div className="text-center text-gray-400">
                        <div className="w-20 h-20 bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                        <p className="text-sm">Vidéo démonstration</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
            </motion.div>
        </motion.div>
      </div>
    </section>
  );
}