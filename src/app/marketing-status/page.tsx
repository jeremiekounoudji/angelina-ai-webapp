'use client';

import Header from '../marketing/components/Header';
import Footer from '../marketing/components/Footer';
import HeroStatus from './components/HeroStatus';
import NeuroProblem from './components/NeuroProblem';
import StatusFeatures from './components/StatusFeatures';
import FreedomCTA from './components/FreedomCTA';

export default function MarketingStatusPage() {
  return (
    <div className="min-h-screen bg-black font-sans text-gray-200">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/10 via-black to-black z-[-1]"></div>
      <div className="fixed inset-0 top-1/4 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] z-[-1] mix-blend-overlay"></div>

      <div className="relative z-10 flex flex-col">
        <Header />
        
        <main>
          {/* Section 1: The Hook */}
          <HeroStatus />

          {/* Section 2: The Neuroscience Problem */}
          <NeuroProblem />

          {/* Section 3: The System Solution */}
          <StatusFeatures />

          {/* Section 4: The Final Push */}
          <FreedomCTA />
        </main>

        <Footer />
      </div>
    </div>
  );
}
