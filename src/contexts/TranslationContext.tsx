'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Locale, 
  TranslationFunction, 
  createTranslationFunction, 
  DEFAULT_LOCALE, 
  detectBrowserLocale,
  formatCurrency,
  formatDate,
  formatRelativeTime
} from '@/locales';

interface TranslationContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationFunction;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date) => string;
  formatRelativeTime: (date: Date) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export function TranslationProvider({ children, initialLocale }: TranslationProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || DEFAULT_LOCALE);
  const [t, setT] = useState<TranslationFunction>(() => createTranslationFunction(locale));

  // Initialize locale from localStorage or browser detection
  useEffect(() => {
    if (!initialLocale) {
      const savedLocale = localStorage.getItem('locale') as Locale;
      const detectedLocale = savedLocale || detectBrowserLocale();
      setLocaleState(detectedLocale);
    }
  }, [initialLocale]);

  // Update translation function when locale changes
  useEffect(() => {
    setT(() => createTranslationFunction(locale));
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    
    // Update document language
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale;
    }
  };

  const contextValue: TranslationContextType = {
    locale,
    setLocale,
    t,
    formatCurrency: (amount: number) => formatCurrency(amount, locale),
    formatDate: (date: Date) => formatDate(date, locale),
    formatRelativeTime: (date: Date) => formatRelativeTime(date, locale),
  };

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation(): TranslationContextType {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

// Hook for specific translation namespaces
export function useTranslationNamespace(namespace: string) {
  const { t, ...rest } = useTranslation();
  
  const namespacedT: TranslationFunction = (key: string, params?: Record<string, string | number>) => {
    return t(`${namespace}.${key}`, params);
  };
  
  return {
    t: namespacedT,
    ...rest,
  };
}