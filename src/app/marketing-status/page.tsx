'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from '../marketing/components/Header';
import Footer from '../marketing/components/Footer';
import HeroStatus from './components/HeroStatus';
import NeuroProblem from './components/NeuroProblem';
import StatusFeatures from './components/StatusFeatures';
import FreedomCTA from './components/FreedomCTA';
import PricingSection from './components/PricingSection';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';

export default function MarketingStatusPage() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [pathname]);

  return (
    <SubscriptionProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 font-sans text-gray-200 overflow-x-hidden">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-black to-black z-[-2]"></div>
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent z-[-2]"></div>

        <div className="fixed inset-0 z-[-1]">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-green-400/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{ y: [0, -100, 0], opacity: [0, 1, 0] }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 10,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col">
          <Header />

          <main>
            <section id="home">
              <HeroStatus />
            </section>

            <section id="features">
              <NeuroProblem />
              <StatusFeatures />
            </section>

            <section id="how-it-works">
              <FreedomCTA />
            </section>

            <PricingSection />
          </main>

          <Footer />
        </div>
      </div>
    </SubscriptionProvider>
  );
}
