'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { t, translations } from './simple';

type Language = 'ar' | 'en';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  direction: 'rtl' | 'ltr';
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
}

export const TranslationProvider = ({ children }: TranslationProviderProps) => {
  const [language, setLanguageState] = useState<Language>('ar');
  const [direction, setDirection] = useState<'rtl' | 'ltr'>('rtl');

  // تحديث الاتجاه عند تغيير اللغة
  useEffect(() => {
    const newDirection = language === 'ar' ? 'rtl' : 'ltr';
    setDirection(newDirection);
    
    // تحديث اتجاه الصفحة
    if (typeof document !== 'undefined') {
      document.documentElement.dir = newDirection;
      document.documentElement.lang = language;
    }
  }, [language]);

  // تحميل اللغة المحفوظة عند بدء التطبيق
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('el7hm-language') as Language;
      if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
        setLanguageState(savedLang);
      }
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('el7hm-language', lang);
    }
  };

  const translate = (key: string): string => {
    return t(key, language);
  };

  const value: TranslationContextType = {
    language,
    setLanguage: handleSetLanguage,
    t: translate,
    direction
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}; 