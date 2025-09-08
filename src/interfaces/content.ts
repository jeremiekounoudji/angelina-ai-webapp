import { Feature, Step, Statistic, Testimonial, PricingTier } from './components';

// Main content structure for the landing page
export interface LandingPageContent {
  hero: {
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary?: string;
    videoUrl?: string;
  };
  features: Feature[];
  howItWorks: Step[];
  benefits: {
    statistics: Statistic[];
    list: string[];
  };
  demo: {
    title: string;
    description: string;
    mediaUrl: string;
  };
  testimonials: Testimonial[];
  pricing: PricingTier[];
}

// Localization interfaces for future i18n support
export interface LocalizedContent {
  [key: string]: {
    [locale: string]: string;
  };
}

// SEO and meta data interfaces
export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  twitterImage?: string;
}