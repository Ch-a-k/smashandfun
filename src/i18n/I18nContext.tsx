"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { pl } from './locales/pl';
import { en } from './locales/en';

export type Locale = 'pl' | 'en';

export type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, options?: { returnObjects?: boolean }) => string | string[] | any;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Приводим типы к any для обхода проблем с типизацией переводов
const translations: Record<Locale, any> = {
  pl: pl as any,
  en: en as any,
};

function validateTranslations() {
  const locales: Locale[] = ['pl', 'en'];
  locales.forEach(locale => {
    if (!translations[locale]) {
      console.error(`Missing translations for locale: ${locale}`);
    }
  });
}

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'pl';

  const savedLocale = localStorage.getItem('locale') as Locale | null;
  if (savedLocale && ['pl', 'en'].includes(savedLocale)) {
    return savedLocale;
  }

  const browserLocale = navigator.language.split('-')[0];
  if (browserLocale === 'pl' || browserLocale === 'en') {
    return browserLocale as Locale;
  }

  return 'pl';
}

type I18nProviderProps = {
  children: ReactNode;
};

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>('pl');

  useEffect(() => {
    // Проверяем переводы при инициализации
    validateTranslations();
    
    // Устанавливаем начальную локаль
    const initialLocale = getInitialLocale();
    setLocaleState(initialLocale);
    
    // Устанавливаем атрибут lang для HTML
    document.documentElement.lang = initialLocale;
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    document.documentElement.lang = newLocale;
  };

  const t = (key: string, options?: { returnObjects?: boolean }): string | string[] | any => {
    try {
      const keys = key.split('.');
      let value: any = translations[locale];

      if (!value) {
        console.error(`No translations found for locale: ${locale}`);
        return key;
      }

      for (const k of keys) {
        if (value[k] === undefined) {
          console.warn(`Translation key not found: ${key}`);
          return key;
        }
        value = value[k];
      }

      if (options?.returnObjects) {
        return value;
      }

      if (typeof value === 'string') {
        return value;
      }

      console.warn(`Translation value is not a string: ${key}`);
      return key;
    } catch (error) {
      console.error(`Error getting translation for key: ${key}`, error);
      return key;
    }
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
