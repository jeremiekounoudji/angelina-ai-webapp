export interface HeroSection {
  title: string;
  subtitle: string;
  ctaText: string;
  rating: number;
  userCount: string;
  userAvatars: string[];
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  ctaText: string;
}

export interface PricingSection {
  title: string;
  subtitle: string;
  plans: PricingPlan[];
  annualDiscount: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQSection {
  title: string;
  items: FAQItem[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
}

export interface TestimonialsSection {
  title: string;
  testimonials: Testimonial[];
}

export interface HowItWorksStep {
  id: string;
  number: string;
  title: string;
  description: string;
  videoUrl?: string;
}

export interface HowItWorksSection {
  title: string;
  steps: HowItWorksStep[];
}

export interface EnterpriseFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface EnterpriseSection {
  title: string;
  subtitle: string;
  features: EnterpriseFeature[];
}

export interface HeaderLink {
  id: string;
  label: string;
  href: string;
}

export interface Header {
  logo: string;
  links: HeaderLink[];
  ctaText: string;
  language: string;
}

export interface FooterLink {
  id: string;
  label: string;
  href: string;
}

export interface Footer {
  rgpd: string;
  company: string;
  socialLinks: FooterLink[];
  copyright: string;
}

export interface MarketingPageData {
  header: Header;
  hero: HeroSection;
  pricing: PricingSection;
  faq: FAQSection;
  testimonials: TestimonialsSection;
  howItWorks: HowItWorksSection;
  enterprise: EnterpriseSection;
  footer: Footer;
}