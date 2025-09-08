'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { fadeInUp, staggerContainer, staggerItem } from '@/utils/animations';

export default function TestimonialsSection() {
  const { t } = useTranslation();

  const testimonials = [
    {
      id: 'amadou',
      name: t('testimonials.items.amadou.name'),
      role: t('testimonials.items.amadou.role'),
      company: t('testimonials.items.amadou.company'),
      content: t('testimonials.items.amadou.content'),
      rating: 5
    },
    {
      id: 'fatou',
      name: t('testimonials.items.fatou.name'),
      role: t('testimonials.items.fatou.role'),
      company: t('testimonials.items.fatou.company'),
      content: t('testimonials.items.fatou.content'),
      rating: 5
    },
    {
      id: 'jean',
      name: t('testimonials.items.jean.name'),
      role: t('testimonials.items.jean.role'),
      company: t('testimonials.items.jean.company'),
      content: t('testimonials.items.jean.content'),
      rating: 5
    },
    {
      id: 'marie',
      name: t('testimonials.items.marie.name'),
      role: t('testimonials.items.marie.role'),
      company: t('testimonials.items.marie.company'),
      content: t('testimonials.items.marie.content'),
      rating: 5
    },
    {
      id: 'kossi',
      name: t('testimonials.items.kossi.name'),
      role: t('testimonials.items.kossi.role'),
      company: t('testimonials.items.kossi.company'),
      content: t('testimonials.items.kossi.content'),
      rating: 5
    },
    {
      id: 'grace',
      name: t('testimonials.items.grace.name'),
      role: t('testimonials.items.grace.role'),
      company: t('testimonials.items.grace.company'),
      content: t('testimonials.items.grace.content'),
      rating: 5
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
          className="text-center"
        >
          {/* Section header */}
          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            {t('testimonials.title')}
          </motion.h2>

          {/* Testimonials grid */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12"
          >
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                variants={staggerItem}
                className=" text-left bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 border border-gray-700 hover:border-green-500/30"
              >
                 <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm mr-3">
                    {typeof testimonial.name === 'string' ? testimonial.name.charAt(0) : 'A'}
                  </div>
                {/* Rating */}
                <div className="flex text-yellow-400 my-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-300 mb-4 leading-relaxed overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center">
                 
                  <div>
                    <h4 className="font-semibold text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {testimonial.role} • {testimonial.company}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
