'use client';

import React from 'react';
import { useTranslation } from '@/lib/translations/simple-context';

export default function TestSimplePage() {
  const { t, language, setLanguage } = useTranslation();

  const testKeys = [
    'home.sections.hero.slide1.title',
    'home.sections.hero.slide1.subtitle',
    'home.sections.services.performanceAnalysis.title',
    'home.sections.services.performanceAnalysis.description',
    'home.sections.services.performanceAnalysis.button'
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">اختبار النظام البسيط</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">اللغة الحالية: {language}</h2>
          <div className="flex gap-4">
            <button 
              onClick={() => setLanguage('ar')}
              className={`px-4 py-2 rounded ${language === 'ar' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
            >
              العربية
            </button>
            <button 
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
            >
              English
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          {testKeys.map((key) => (
            <div key={key} className="p-4 bg-white rounded-lg shadow">
              <div className="text-sm text-gray-500 mb-2">المفتاح: {key}</div>
              <div className="text-lg font-semibold">الترجمة: {t(key)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 