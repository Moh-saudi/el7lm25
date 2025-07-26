'use client';

import React from 'react';

export default function TestTranslationFinalPage() {
  const [mounted, setMounted] = React.useState(false);
  const [result, setResult] = React.useState<string>('');

  React.useEffect(() => {
    setMounted(true);
    
    // اختبار مباشر للترجمة
    try {
      const arModule = require('@/lib/translations/ar');
      const translations = arModule.default;
      
      const testKey = 'home.sections.hero.slide1.title';
      const keys = testKey.split('.');
      let current: any = translations;
      
      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          current = null;
          break;
        }
      }
      
      setResult(current || 'غير موجود');
    } catch (error) {
      setResult(`خطأ: ${error.message}`);
    }
  }, []);

  if (!mounted) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">اختبار الترجمة النهائي</h1>
        
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-2">المفتاح: home.sections.hero.slide1.title</div>
          <div className="text-lg font-semibold">النتيجة: {result}</div>
        </div>
      </div>
    </div>
  );
} 