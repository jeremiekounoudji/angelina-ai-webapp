'use client';

import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { Locale, SUPPORTED_LOCALES } from '@/locales';

interface LanguageSwitcherProps {
  className?: string;
  showLabels?: boolean;
}

const LOCALE_LABELS: Record<Locale, { flag: string; label: string }> = {
  en: { flag: '🇺🇸', label: 'English' },
  fr: { flag: '🇫🇷', label: 'Français' },
};

export function LanguageSwitcher({ className = '', showLabels = false }: LanguageSwitcherProps) {
  const { locale, setLocale } = useTranslation();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {SUPPORTED_LOCALES.map((supportedLocale) => (
        <button
          key={supportedLocale}
          onClick={() => setLocale(supportedLocale)}
          className={`
            flex items-center space-x-1 px-2 py-1 rounded-md transition-colors
            ${locale === supportedLocale 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }
          `}
          aria-label={`Switch to ${LOCALE_LABELS[supportedLocale].label}`}
        >
          <span className="text-lg">{LOCALE_LABELS[supportedLocale].flag}</span>
          {showLabels && (
            <span className="text-sm font-medium">
              {LOCALE_LABELS[supportedLocale].label}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// Dropdown version for more locales
export function LanguageDropdown({ className = '' }: { className?: string }) {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div className={`relative ${className}`}>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="
          appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
          rounded-md px-3 py-2 pr-8 text-sm font-medium
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        "
        aria-label={t('common.navigation.language') || 'Select language'}
      >
        {SUPPORTED_LOCALES.map((supportedLocale) => (
          <option key={supportedLocale} value={supportedLocale}>
            {LOCALE_LABELS[supportedLocale].flag} {LOCALE_LABELS[supportedLocale].label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}