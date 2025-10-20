// Translation utility functions and types
export type Locale = 'en' | 'fr';

export interface TranslationFunction {
  (key: string, params?: Record<string, string | number>): string;
}

// Import all translation files
import enCommon from './en/common.json';
import frCommon from './fr/common.json';
import enMarketing from './en/marketing.json';
import frMarketing from './fr/marketing.json';
import enAuth from './en/auth.json';
import frAuth from './fr/auth.json';
import enDashboard from './en/dashboard.json';
import frDashboard from './fr/dashboard.json';
import enHooks from './en/hooks.json';
import frHooks from './fr/hooks.json';
import enApi from './en/api.json';
import frApi from './fr/api.json';

// Combine all translations
export const translations = {
  en: {
    common: enCommon,
    marketing: enMarketing,
    auth: enAuth,
    dashboard: enDashboard,
    hooks: enHooks,
    api: enApi,
  },
  fr: {
    common: frCommon,
    marketing: frMarketing,
    auth: frAuth,
    dashboard: frDashboard,
    hooks: frHooks,
    api: frApi,
  },
};

// Get nested value from object using dot notation
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Replace parameters in translation string
function replaceParams(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  
  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`{${key}}`, 'g'), String(value));
  }, text);
}

// Main translation function
export function createTranslationFunction(locale: Locale): TranslationFunction {
  return (key: string, params?: Record<string, string | number>): string => {
    const translation = getNestedValue(translations[locale], key);
    
    if (typeof translation === 'string') {
      return replaceParams(translation, params);
    }
    
    // Fallback to English if translation not found
    if (locale !== 'en') {
      const fallback = getNestedValue(translations.en, key);
      if (typeof fallback === 'string') {
        return replaceParams(fallback, params);
      }
    }
    
    // Return key if no translation found
    console.warn(`Translation missing for key: ${key} in locale: ${locale}`);
    return key;
  };
}

// Export default locales
export const DEFAULT_LOCALE: Locale = 'en';
export const SUPPORTED_LOCALES: Locale[] = ['en', 'fr'];

// Utility to detect browser locale
export function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  
  const browserLocale = navigator.language.split('-')[0] as Locale;
  return SUPPORTED_LOCALES.includes(browserLocale) ? browserLocale : DEFAULT_LOCALE;
}

// Utility to format currency based on locale
export function formatCurrency(amount: number, locale: Locale): string {
  const currency = locale === 'fr' ? 'EUR' : 'USD';
  const localeCode = locale === 'fr' ? 'fr-FR' : 'en-US';
  
  return new Intl.NumberFormat(localeCode, {
    style: 'currency',
    currency,
  }).format(amount);
}

// Utility to format date based on locale
export function formatDate(date: Date, locale: Locale): string {
  const localeCode = locale === 'fr' ? 'fr-FR' : 'en-US';
  
  return new Intl.DateTimeFormat(localeCode, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Utility to format relative time based on locale
export function formatRelativeTime(date: Date, locale: Locale): string {
  const localeCode = locale === 'fr' ? 'fr-FR' : 'en-US';
  const rtf = new Intl.RelativeTimeFormat(localeCode, { numeric: 'auto' });
  
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  
  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(diffInSeconds, 'second');
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) {
    return rtf.format(diffInMinutes, 'minute');
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    return rtf.format(diffInHours, 'hour');
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return rtf.format(diffInDays, 'day');
}