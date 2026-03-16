'use client';

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/utils/animations';
import { CalendarDays, Repeat, Image as ImageIcon, Zap, Clock, LayoutDashboard, Shield } from 'lucide-react';
import { useTranslationNamespace } from '@/contexts/TranslationContext';

const featureKeys = [
  {
    key: "precision",
    icon: CalendarDays,
    color: "text-[#328E6E]",
    bg: "bg-[#328E6E]/10",
    border: "border-[#328E6E]/20",
    size: "large"
  },
  {
    key: "recurring",
    icon: Repeat,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    size: "medium"
  },
  {
    key: "media",
    icon: ImageIcon,
    color: "text-[#328E6E]",
    bg: "bg-[#328E6E]/10",
    border: "border-[#328E6E]/20",
    size: "medium"
  },
  {
    key: "background",
    icon: Zap,
    color: "text-emerald-300",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    size: "large"
  },
  {
    key: "analytics",
    icon: LayoutDashboard,
    color: "text-[#328E6E]",
    bg: "bg-[#328E6E]/10",
    border: "border-[#328E6E]/20",
    size: "small"
  },
  {
    key: "security",
    icon: Shield,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    size: "small"
  }
];

export default function StatusFeatures() {
  const { t } = useTranslationNamespace('marketing.statusFeatures');

  const getGridClass = (size: string, index: number) => {
    switch (size) {
      case 'large':
        return 'md:col-span-2 md:row-span-2';
      case 'medium':
        return 'md:col-span-1 md:row-span-2';
      case 'small':
        return 'md:col-span-1 md:row-span-1';
      default:
        return 'md:col-span-1 md:row-span-1';
    }
  };

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#328E6E]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#328E6E]/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 right-10 w-20 h-20 border border-[#328E6E]/20 rounded-2xl"
        animate={{ rotate: 360, y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-20 left-10 w-16 h-16 border border-[#328E6E]/20 rounded-full"
        animate={{ rotate: -360, x: [0, 20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="text-center mb-20"
        >
          <motion.h2 
            variants={fadeInUp} 
            className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
          >
            {t('title')} <span className="text-[#328E6E]">{t('titleHighlight')}</span>
          </motion.h2>
          <motion.p 
            variants={fadeInUp} 
            className="text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto leading-relaxed"
          >
            {t('subtitle')}
          </motion.p>
        </motion.div>

        {/* Bento Grid Layout */}
        <motion.div 
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr"
        >
          {featureKeys.map((feature, index) => {
            const Icon = feature.icon;
            const isLarge = feature.size === 'large';
            const isMedium = feature.size === 'medium';
            
            return (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className={`
                  ${getGridClass(feature.size, index)}
                  ${feature.bg} ${feature.border}
                  backdrop-blur-sm border rounded-3xl p-8 
                  hover:border-opacity-50 hover:scale-[1.02] 
                  transition-all duration-500 group cursor-pointer
                  shadow-2xl hover:shadow-3xl
                  ${isLarge ? 'min-h-[400px]' : isMedium ? 'min-h-[300px]' : 'min-h-[200px]'}
                  flex flex-col justify-between
                `}
                whileHover={{ y: -5 }}
              >
                <div className="flex flex-col h-full">
                  {/* Icon Section */}
                  <div className="flex items-start justify-between mb-6">
                    <motion.div 
                      className={`
                        ${isLarge ? 'w-20 h-20' : 'w-16 h-16'} 
                        rounded-2xl flex items-center justify-center shrink-0 
                        ${feature.bg} ${feature.border} border backdrop-blur-sm
                        group-hover:scale-110 transition-transform duration-300
                      `}
                      whileHover={{ rotate: 5 }}
                    >
                      <Icon className={`${isLarge ? 'w-10 h-10' : 'w-8 h-8'} ${feature.color}`} />
                    </motion.div>
                    
                    {/* Decorative dots for large cards */}
                    {isLarge && (
                      <div className="flex gap-2">
                        <div className={`w-2 h-2 rounded-full ${feature.color.replace('text-', 'bg-')}/30`}></div>
                        <div className={`w-2 h-2 rounded-full ${feature.color.replace('text-', 'bg-')}/20`}></div>
                        <div className={`w-2 h-2 rounded-full ${feature.color.replace('text-', 'bg-')}/10`}></div>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className={`
                      ${isLarge ? 'text-3xl' : isMedium ? 'text-2xl' : 'text-xl'} 
                      font-bold text-white mb-4 
                      group-hover:${feature.color} transition-colors duration-300
                    `}>
                      {t(`items.${feature.key}.title`)}
                    </h3>
                    <p className={`
                      text-gray-400 leading-relaxed 
                      ${isLarge ? 'text-lg' : 'text-base'}
                      group-hover:text-gray-300 transition-colors duration-300
                    `}>
                      {t(`items.${feature.key}.description`)}
                    </p>
                  </div>

                  {/* Bottom accent for large cards */}
                  {isLarge && (
                    <div className="mt-6 pt-4 border-t border-gray-800/50">
                      <div className={`w-full h-1 rounded-full ${feature.color.replace('text-', 'bg-')}/20 group-hover:${feature.color.replace('text-', 'bg-')}/40 transition-all duration-300`}></div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-20"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#328E6E]/10 border border-[#328E6E]/30 rounded-full text-[#328E6E] text-sm font-medium mb-8">
            <Clock className="w-4 h-4" />
            <span>Setup takes less than 5 minutes</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
