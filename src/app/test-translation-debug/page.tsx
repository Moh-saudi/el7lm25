'use client';

import React from 'react';
import { t } from '@/lib/translations/index';

export default function TestTranslationDebugPage() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>جاري التحميل...</div>;
  }

  // اختبار مباشر لدالة الترجمة
  const testKey = 'home.sections.hero.slide1.title';
  const result = t(testKey, 'ar');

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">اختبار نظام الترجمة - Debug</h1>
        
        <div className="grid gap-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-sm text-gray-500 mb-2">المفتاح: {testKey}</div>
            <div className="text-lg font-semibold">النتيجة: {result}</div>
            <div className="text-sm text-gray-600 mt-2">
              نوع النتيجة: {typeof result}
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-2">اختبار مفاتيح أخرى:</h3>
            <div className="space-y-2">
              <div>slide1.subtitle: {t('home.sections.hero.slide1.subtitle', 'ar')}</div>
              <div>slide2.title: {t('home.sections.hero.slide2.title', 'ar')}</div>
              <div>services.title: {t('home.sections.services.title', 'ar')}</div>
              <div>performanceAnalysis.title: {t('home.sections.services.performanceAnalysis.title', 'ar')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 