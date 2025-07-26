'use client';

import React from 'react';

export default function TestTranslationImportPage() {
  const [mounted, setMounted] = React.useState(false);
  const [arTranslations, setArTranslations] = React.useState<any>(null);

  React.useEffect(() => {
    setMounted(true);
    
    // استيراد ملف الترجمة مباشرة
    import('@/lib/translations/ar').then((module) => {
      const translations = module.default;
      setArTranslations(translations);
      console.log('Arabic translations loaded:', translations);
    }).catch((error) => {
      console.error('Error loading Arabic translations:', error);
    });
  }, []);

  if (!mounted) {
    return <div>جاري التحميل...</div>;
  }

  if (!arTranslations) {
    return <div>جاري تحميل الترجمات...</div>;
  }

  // اختبار الوصول للمفاتيح
  const testKey = 'home.sections.hero.slide1.title';
  const keys = testKey.split('.');
  let current: any = arTranslations;
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      current = null;
      break;
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">اختبار استيراد الترجمة</h1>
        
        <div className="grid gap-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-sm text-gray-500 mb-2">المفتاح: {testKey}</div>
            <div className="text-lg font-semibold">النتيجة: {current || 'غير موجود'}</div>
            <div className="text-sm text-gray-600 mt-2">
              نوع النتيجة: {typeof current}
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-2">هيكل الترجمات:</h3>
            <pre className="text-xs overflow-auto max-h-96">
              {JSON.stringify(arTranslations, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 