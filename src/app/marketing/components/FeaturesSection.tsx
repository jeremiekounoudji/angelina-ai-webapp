'use client'

import { motion } from 'framer-motion';
import { useTranslationNamespace } from '@/contexts/TranslationContext';
import { fadeInUp, staggerContainer } from '@/utils/animations';

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  highlight?: boolean;
}

interface FeaturesSectionProps {
  className?: string;
}

export default function FeaturesSection({ className = '' }: FeaturesSectionProps) {
  const { t } = useTranslationNamespace('marketing.features');
  
  const features: Feature[] = [
    {
      id: '1',
      icon: '📱',
      title: 'WhatsApp Integration',
      description: 'Seamlessly integrate with WhatsApp Business API for instant customer communication and order management.',
      highlight: true
    },
    {
      id: '2',
      icon: '🤖',
      title: 'AI-Powered Assistant',
      description: 'Advanced AI understands natural language and handles complex restaurant operations automatically.',
    },
    {
      id: '3',
      icon: '📋',
      title: 'Order Management',
      description: 'Automatically process orders, manage modifications, and track delivery status in real-time.',
    },
    {
      id: '4',
      icon: '📦',
      title: 'Inventory Tracking',
      description: 'Smart inventory management with low-stock alerts and automated supplier ordering.',
    },
    {
      id: '5',
      icon: '🚚',
      title: 'Delivery Coordination',
      description: 'Coordinate with delivery partners, track orders, and provide real-time updates to customers.',
    },
    {
      id: '6',
      icon: '💬',
      title: 'Customer Support',
      description: 'Handle customer complaints, feedback, and inquiries with intelligent response suggestions.',
    },
    {
      id: '7',
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights into sales, customer behavior, and operational efficiency.',
    },
    {
      id: '8',
      icon: '🔄',
      title: '24/7 Automation',
      description: 'Round-the-clock operation ensuring no customer inquiry or order goes unattended.',
    }
  ];

  return (
    <section id="features" className={`py-20  ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            {t('title')}
            <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent"> {t('titleHighlight')}</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            {t('subtitle')}
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={fadeInUp}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`relative p-6 rounded-2xl transition-all duration-300 ${
                feature.highlight 
                  ? 'bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30' 
                  : 'bg-gray-800/50 border border-gray-700/50 hover:border-green-500/30'
              }`}
            >
              {feature.highlight && (
                <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  {t('popular')}
                </div>
              )}
              
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-transparent rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center space-x-2 bg-gray-800/50 px-6 py-3 rounded-full border border-gray-700">
            <span className="text-green-400">✨</span>
            <span className="text-gray-300">{t('comingSoon')}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}