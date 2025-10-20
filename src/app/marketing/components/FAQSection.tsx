'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslationNamespace } from '@/contexts/TranslationContext';
import { fadeInUp, staggerContainer, staggerItem } from '@/utils/animations';

export default function FAQSection() {
  const { t } = useTranslationNamespace('marketing.faq');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const faqItems = [
    {
      id: 'orders',
      question: t('items.orders.question'),
      answer: t('items.orders.answer')
    },
    {
      id: 'stocks',
      question: t('items.stocks.question'),
      answer: t('items.stocks.answer')
    },
    {
      id: 'complaints',
      question: t('items.complaints.question'),
      answer: t('items.complaints.answer')
    },
    {
      id: 'marketplace',
      question: t('items.marketplace.question'),
      answer: t('items.marketplace.answer')
    }
  ];

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="text-center"
        >
          {/* Section header */}
          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            {t('title')}
          </motion.h2>

          {/* FAQ Items */}
          <motion.div
            variants={staggerContainer}
            className="space-y-4"
          >
            {faqItems.map((item) => (
              <motion.div
                key={item.id}
                variants={staggerItem}
                className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-700 hover:border-green-500/30 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-6 py-6 text-left flex justify-between items-center hover:bg-gray-800/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-white pr-4">
                    {item.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openItems.has(item.id) ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <svg className="w-6 h-6 text-gray-300 group-hover:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openItems.has(item.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <p className="text-gray-300 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
