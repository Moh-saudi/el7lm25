'use client';

import React from 'react';
import { useTranslation } from '@/lib/translations/simple-context';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import UnifiedHeader from '@/components/layout/UnifiedHeader';

export default function TestLanguageSwitcherPage() {
  const { t, language, direction } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50" dir={direction}>
      {/* Header مع زر تبديل اللغة */}
      <UnifiedHeader 
        variant="default"
        showLanguageSwitcher={true}
        showNotifications={true}
        showUserMenu={true}
        title="اختبار تبديل اللغة"
      />

      <div className="pt-16">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            
            {/* العنوان الرئيسي */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                اختبار زر تبديل اللغة
              </h1>
              <p className="text-gray-600">
                اللغة الحالية: <span className="font-semibold">{language === 'ar' ? 'العربية' : 'English'}</span>
              </p>
              <p className="text-gray-600">
                الاتجاه: <span className="font-semibold">{direction === 'rtl' ? 'من اليمين لليسار' : 'من اليسار لليمين'}</span>
              </p>
            </div>

            {/* أنماط مختلفة من مبدل اللغة */}
            <div className="space-y-8">
              
              {/* النمط البسيط */}
              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">النمط البسيط (Simple)</h2>
                <div className="flex items-center justify-center">
                  <LanguageSwitcher variant="simple" />
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  زر دائري بسيط مع العلم فقط
                </p>
              </div>

              {/* النمط المنسدل */}
              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">النمط المنسدل (Dropdown)</h2>
                <div className="flex items-center justify-center">
                  <LanguageSwitcher variant="dropdown" />
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  قائمة منسدلة مع العلم والاسم
                </p>
              </div>

              {/* النمط الأزرار */}
              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">النمط الأزرار (Button)</h2>
                <div className="flex items-center justify-center">
                  <LanguageSwitcher variant="button" />
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  أزرار منفصلة لكل لغة
                </p>
              </div>

              {/* النمط البسيط */}
              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">النمط البسيط (Minimal)</h2>
                <div className="flex items-center justify-center">
                  <LanguageSwitcher variant="minimal" />
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  أعلام فقط بدون أسماء
                </p>
              </div>
            </div>

            {/* اختبار النصوص المترجمة */}
            <div className="mt-8 border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">اختبار النصوص المترجمة</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p><strong>الإشعارات:</strong> {t('header.notifications')}</p>
                  <p><strong>الإعدادات:</strong> {t('header.settings')}</p>
                  <p><strong>تسجيل الخروج:</strong> {t('header.signOut')}</p>
                  <p><strong>المستخدم:</strong> {t('header.user')}</p>
                </div>
                <div className="space-y-2">
                  <p><strong>لاعب:</strong> {t('header.role.player')}</p>
                  <p><strong>نادي:</strong> {t('header.role.club')}</p>
                  <p><strong>وكيل:</strong> {t('header.role.agent')}</p>
                  <p><strong>أكاديمية:</strong> {t('header.role.academy')}</p>
                </div>
              </div>
            </div>

            {/* معلومات تقنية */}
            <div className="mt-8 border rounded-lg p-6 bg-gray-50">
              <h2 className="text-xl font-semibold mb-4">معلومات تقنية</h2>
              <div className="space-y-2 text-sm">
                <p><strong>نظام الترجمة:</strong> نظام ترجمة مبسط يدعم العربية والإنجليزية</p>
                <p><strong>التخزين:</strong> يتم حفظ اللغة المختارة في localStorage</p>
                <p><strong>الاتجاه:</strong> يتغير تلقائياً حسب اللغة (RTL للعربية، LTR للإنجليزية)</p>
                <p><strong>المكونات:</strong> LanguageSwitcher, UnifiedHeader, useTranslation hook</p>
                <p><strong>الملفات:</strong> src/lib/translations/simple.ts, src/components/shared/LanguageSwitcher.tsx</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
} 