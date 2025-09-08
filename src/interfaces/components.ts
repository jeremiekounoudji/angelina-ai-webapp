import { ReactNode } from 'react';

// Core component interfaces
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// Navigation interfaces
export interface NavbarProps extends BaseComponentProps {
  links?: Array<{ label: string; href: string }>;
  logo?: string;
}

export interface FooterProps extends BaseComponentProps {
  links?: Array<{ label: string; href: string }>;
  socialLinks?: Array<{ label: string; href: string }>;
}

// Button interfaces
export interface AnimatedButtonProps extends BaseComponentProps {
  variant: 'primary' | 'secondary' | 'outline';
  size: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

// Video component interfaces
export interface VideoPreviewProps extends BaseComponentProps {
  src: string;
  poster?: string;
  autoplay?: boolean;
  controls?: boolean;
}

// Hero section interfaces
export interface HeroSectionProps extends BaseComponentProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaAction: () => void;
  videoPreviewUrl?: string;
}

// Features interfaces
export interface Feature {
  id: string;
  icon: ReactNode | string;
  title: string;
  description: string;
  highlight?: boolean;
}

export interface FeaturesSectionProps extends BaseComponentProps {
  features: Feature[];
  title: string;
  subtitle?: string;
}

// How it works interfaces
export interface Step {
  id: string;
  number: number;
  title: string;
  description: string;
  image?: string;
  icon?: ReactNode;
}

export interface HowItWorksSectionProps extends BaseComponentProps {
  steps: Step[];
  title: string;
}

// Benefits interfaces
export interface Statistic {
  value: string;
  label: string;
  description?: string;
}

export interface BenefitsSectionProps extends BaseComponentProps {
  statistics: Statistic[];
  benefits: string[];
  title: string;
}

// Demo interfaces
export interface DemoSectionProps extends BaseComponentProps {
  title: string;
  description: string;
  demoType: 'video' | 'interactive' | 'screenshots';
  mediaUrl?: string;
  screenshots?: string[];
}

// Testimonials interfaces
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar?: string;
  rating: number;
}

export interface TestimonialsSectionProps extends BaseComponentProps {
  testimonials: Testimonial[];
  title: string;
}

// Pricing interfaces
export interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
  ctaText: string;
}

export interface PricingSectionProps extends BaseComponentProps {
  tiers: PricingTier[];
  title: string;
}