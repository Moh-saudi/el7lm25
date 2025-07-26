'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/translations/simple-context';

type Language = 'ar' | 'en';

const SUPPORTED_LANGUAGES = {
  ar: {
    name: 'العربية',
    nativeName: 'العربية',
    flag: '🇸🇦'
  },
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  }
} as const;
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'button' | 'dropdown' | 'minimal' | 'simple';
  showFlags?: boolean;
  showNames?: boolean;
}

export default function LanguageSwitcher({ 
  className = '', 
  variant = 'dropdown',
  showFlags = true,
  showNames = true 
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = SUPPORTED_LANGUAGES[language];

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setIsOpen(false);
    
    // تحديث اتجاه الصفحة
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
    
    // إعادة تحميل الصفحة لتطبيق التغييرات على جميع المكونات
    // setTimeout(() => {
    //   window.location.reload();
    // }, 100);
  };

  // مكون الأزرار البسيط
  if (variant === 'button') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {Object.entries(SUPPORTED_LANGUAGES).map(([lang, info]) => (
          <button
            key={lang}
            onClick={() => handleLanguageChange(lang as Language)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              language === lang
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {showFlags && <span className="text-lg">{info.flag}</span>}
              {showNames && <span>{info.name}</span>}
            </div>
          </button>
        ))}
      </div>
    );
  }

  // مكون القائمة المنسدلة
  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
        >
          <Globe className="w-4 h-4 text-gray-600" />
          {showFlags && <span className="text-lg">{currentLanguage.flag}</span>}
          {showNames && <span className="text-sm font-medium">{currentLanguage.name}</span>}
          <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
            {Object.entries(SUPPORTED_LANGUAGES).map(([lang, info]) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang as Language)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  language === lang ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {showFlags && <span className="text-lg">{info.flag}</span>}
                  {showNames && <span className="text-sm font-medium">{info.name}</span>}
                </div>
                {language === lang && <Check className="w-4 h-4 text-blue-600" />}
              </button>
            ))}
          </div>
        )}

        {/* إغلاق القائمة عند النقر خارجها */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  }

  // مكون بسيط
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {Object.entries(SUPPORTED_LANGUAGES).map(([lang, info]) => (
          <button
            key={lang}
            onClick={() => handleLanguageChange(lang as Language)}
            className={`p-1 rounded transition-all ${
              language === lang
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title={info.name}
          >
            {showFlags && <span className="text-lg">{info.flag}</span>}
          </button>
        ))}
      </div>
    );
  }

  // مكون بسيط جديد - زر واحد مناسب لجميع الألوان
  if (variant === 'simple') {
    const nextLanguage = language === 'ar' ? 'en' : 'ar';
    const nextLanguageInfo = SUPPORTED_LANGUAGES[nextLanguage];
    
    return (
      <button
        onClick={() => handleLanguageChange(nextLanguage)}
        className={`${className} w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border-2 border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110`}
        title={`تغيير إلى ${nextLanguageInfo.name} / Switch to ${nextLanguageInfo.name}`}
      >
        <span className="text-lg font-bold text-gray-700 hover:text-gray-900 transition-colors">
          {nextLanguageInfo.flag}
        </span>
      </button>
    );
  }

  // مكون بسيط
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Object.entries(SUPPORTED_LANGUAGES).map(([lang, info]) => (
        <button
          key={lang}
          onClick={() => handleLanguageChange(lang as Language)}
          className={`p-1 rounded transition-all ${
            language === lang
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          title={info.name}
        >
          {showFlags && <span className="text-lg">{info.flag}</span>}
        </button>
      ))}
    </div>
  );
} 