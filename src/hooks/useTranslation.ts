'use client';

import { useState, useEffect } from 'react';
import { translations } from '@/locales/translations';

type Locale = 'fr' | 'en';

interface TranslationData {
  [key: string]: string | string[] | TranslationData;
}

export const useTranslation = () => {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('angelina-ai-locale') as Locale;
      return savedLocale || 'fr';
    }
    return 'fr';
  });

  const t = (key: string): string | string[] => {
    const keys = key.split('.');
    let value: string | string[] | TranslationData = translations[locale];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && !Array.isArray(value) && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return typeof value === 'string' || Array.isArray(value) ? value : key;
  };

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('angelina-ai-locale', newLocale);
    }
  };

  // Persist locale changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('angelina-ai-locale', locale);
    }
  }, [locale]);

  return {
    t,
    locale,
    changeLocale,
    isLoading: false
  };
};