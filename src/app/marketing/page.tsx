'use client';

import Header from './components/Header';
import HeroSection from './components/HeroSection';
import PricingSection from './components/PricingSection';
import FAQSection from './components/FAQSection';
import TestimonialsSection from './components/TestimonialsSection';
import HowItWorksSection from './components/HowItWorksSection';
import EnterpriseSection from './components/EnterpriseSection';
import Footer from './components/Footer';
import DemoSection from './components/DemoSection';
import FeaturesSection from './components/FeaturesSection';

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-500/10 via-transparent to-transparent"></div>
      <div className="fixed top-0 left-0 w-full h-full opacity-50">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300ff00' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-green-400/5 rounded-full blur-3xl"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col">
        <Header />
        <div id="home">
          <HeroSection />
        </div>
        <DemoSection />
        <div id="features">
          <FeaturesSection />
        </div>
        <div id="pricing">
          <PricingSection />
        </div>
        <FAQSection />
        <TestimonialsSection />
        <div id="how-it-works">
          <HowItWorksSection />
        </div>
        <EnterpriseSection />
        <div id="contact">
          <Footer />
        </div>
      </div>
    </div>
  );
}