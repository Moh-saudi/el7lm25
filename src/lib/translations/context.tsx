'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Direction, getDefaultLanguage, getLanguageDirection, setLanguage, t, tWithVars, formatDate, formatNumber, formatCurrency } from './index';

interface TranslationContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  tWithVars: (key: string, vars: Record<string, any>, fallback?: string) => string;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (number: number) => string;
  formatCurrency: (amount: number, currency?: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

interface TranslationProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export const TranslationProvider = ({ 
  children, 
  defaultLanguage = 'ar' // دائماً نبدأ بالعربية لتجنب مشاكل hydration
}: TranslationProviderProps) => {
  const [language, setLanguageState] = useState<Language>('ar'); // دائماً نبدأ بالعربية
  const [isClient, setIsClient] = useState(false);
  const direction = getLanguageDirection(language);

  // التأكد من أننا على العميل
  useEffect(() => {
    setIsClient(true);
    const savedLang = localStorage.getItem('el7hm-language') as Language;
    if (savedLang && savedLang !== language) {
      setLanguageState(savedLang);
    }
  }, []);

  useEffect(() => {
    setLanguage(language);
  }, [language]);

  // مراقبة التغييرات في localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const savedLang = localStorage.getItem('el7hm-language') as Language;
      if (savedLang && savedLang !== language) {
        setLanguageState(savedLang);
      }
    };

    // مراقبة التغييرات في localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // التحقق من localStorage عند تحميل الصفحة
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('el7hm-language') as Language;
      if (savedLang && savedLang !== language) {
        setLanguageState(savedLang);
      }
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [language]);

  const handleSetLanguage = (lang: Language) => {
    setLanguageState(lang);
    setLanguage(lang);
  };

  // دالة الترجمة الأساسية
  const translate = (key: string, fallback?: string): string => {
    return t(key, language, fallback);
  };

  // دالة الترجمة مع متغيرات
  const translateWithVars = (key: string, vars: Record<string, any> = {}, fallback?: string): string => {
    return tWithVars(key, vars, language, fallback);
  };

  // تنسيق التاريخ
  const formatDateWithLang = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    return formatDate(date, language, options);
  };

  // تنسيق الأرقام
  const formatNumberWithLang = (number: number): string => {
    return formatNumber(number, language);
  };

  // تنسيق العملة
  const formatCurrencyWithLang = (amount: number, currency: string = 'EGP'): string => {
    return formatCurrency(amount, currency, language);
  };

  const value: TranslationContextType = {
    language,
    direction,
    setLanguage: handleSetLanguage,
    t: translate,
    tWithVars: translateWithVars,
    formatDate: formatDateWithLang,
    formatNumber: formatNumberWithLang,
    formatCurrency: formatCurrencyWithLang
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}; 