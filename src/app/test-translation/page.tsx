'use client';

import React from 'react';
import { useTranslation } from '@/lib/translations/simple-context';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';

export default function TestTranslationPage() {
  const { t, language, direction } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50" dir={direction}>
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              اختبار الترجمة / Translation Test
            </h1>
            <div className="flex items-center justify-center gap-4">
              <LanguageSwitcher variant="simple" />
              <span className="text-sm text-gray-600">
                اللغة الحالية: {language === 'ar' ? 'العربية' : 'English'}
              </span>
            </div>
          </div>

          {/* اختبار النصوص */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* القائمة الجانبية */}
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">القائمة الجانبية / Sidebar</h2>
              <div className="space-y-2">
                <p><strong>الرئيسية:</strong> {t('sidebar.player.home')}</p>
                <p><strong>الملف الشخصي:</strong> {t('sidebar.player.profile')}</p>
                <p><strong>التقارير:</strong> {t('sidebar.player.reports')}</p>
                <p><strong>الفيديوهات:</strong> {t('sidebar.player.videos')}</p>
                <p><strong>البحث:</strong> {t('sidebar.player.search')}</p>
                <p><strong>الإحصائيات:</strong> {t('sidebar.player.stats')}</p>
                <p><strong>الرسائل:</strong> {t('sidebar.common.messages')}</p>
                <p><strong>تسجيل الخروج:</strong> {t('sidebar.common.logout')}</p>
              </div>
            </div>

            {/* الهيدر */}
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">الهيدر / Header</h2>
              <div className="space-y-2">
                <p><strong>الإشعارات:</strong> {t('header.notifications')}</p>
                <p><strong>الإعدادات:</strong> {t('header.settings')}</p>
                <p><strong>تسجيل الخروج:</strong> {t('header.signOut')}</p>
                <p><strong>المستخدم:</strong> {t('header.user')}</p>
                <p><strong>لاعب:</strong> {t('header.role.player')}</p>
                <p><strong>نادي:</strong> {t('header.role.club')}</p>
                <p><strong>وكيل:</strong> {t('header.role.agent')}</p>
                <p><strong>أكاديمية:</strong> {t('header.role.academy')}</p>
          </div>
        </div>

            {/* تسجيل الدخول */}
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">تسجيل الدخول / Login</h2>
              <div className="space-y-2">
                <p><strong>البريد الإلكتروني:</strong> {t('login.form.email')}</p>
                <p><strong>كلمة المرور:</strong> {t('login.form.password')}</p>
                <p><strong>تسجيل الدخول:</strong> {t('login.form.submit')}</p>
                <p><strong>نسيت كلمة المرور:</strong> {t('login.form.forgotPassword')}</p>
                <p><strong>إنشاء حساب:</strong> {t('login.form.createAccount')}</p>
              </div>
                </div>

            {/* OTP */}
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">رمز التحقق / OTP</h2>
              <div className="space-y-2">
                <p><strong>التحقق من رقم الهاتف:</strong> {t('otp.title')}</p>
                <p><strong>إعادة الإرسال:</strong> {t('otp.resend')}</p>
                <p><strong>إلغاء:</strong> {t('otp.cancel')}</p>
                <p><strong>الوقت المتبقي:</strong> {t('otp.timeLeft')}</p>
                <p><strong>انتهت صلاحية الكود:</strong> {t('otp.expired')}</p>
              </div>
            </div>
          </div>

          {/* معلومات تقنية */}
          <div className="mt-8 border rounded-lg p-6 bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">معلومات تقنية / Technical Info</h2>
            <div className="space-y-2 text-sm">
              <p><strong>اللغة الحالية:</strong> {language}</p>
              <p><strong>الاتجاه:</strong> {direction}</p>
              <p><strong>اتجاه الصفحة:</strong> {typeof document !== 'undefined' ? document.documentElement.dir : 'N/A'}</p>
              <p><strong>لغة الصفحة:</strong> {typeof document !== 'undefined' ? document.documentElement.lang : 'N/A'}</p>
              <p><strong>مفتاح التخزين:</strong> el7hm-language</p>
              <p><strong>القيمة المحفوظة:</strong> {typeof window !== 'undefined' ? localStorage.getItem('el7hm-language') : 'N/A'}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
} 