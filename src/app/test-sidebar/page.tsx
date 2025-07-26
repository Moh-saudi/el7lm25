'use client';

import React from 'react';
import { useTranslation } from '@/lib/translations/simple-context';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import Sidebar from '@/components/layout/Sidebar';

export default function TestSidebarPage() {
  const { t, language, direction } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50" dir={direction}>
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 ml-64 rtl:mr-64">
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-lg p-8">
              
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  اختبار القائمة الجانبية / Sidebar Test
                </h1>
                <div className="flex items-center justify-center gap-4">
                  <LanguageSwitcher variant="simple" />
                  <span className="text-sm text-gray-600">
                    اللغة الحالية: {language === 'ar' ? 'العربية' : 'English'}
                  </span>
                </div>
              </div>

              {/* اختبار عناصر القائمة الجانبية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* قائمة اللاعب */}
                <div className="border rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">قائمة اللاعب / Player Menu</h2>
                  <div className="space-y-2">
                    <p><strong>الرئيسية:</strong> {t('sidebar.player.home')}</p>
                    <p><strong>الملف الشخصي:</strong> {t('sidebar.player.profile')}</p>
                    <p><strong>التقارير:</strong> {t('sidebar.player.reports')}</p>
                    <p><strong>الفيديوهات:</strong> {t('sidebar.player.videos')}</p>
                    <p><strong>البحث:</strong> {t('sidebar.player.search')}</p>
                    <p><strong>الإحصائيات:</strong> {t('sidebar.player.stats')}</p>
                    <p><strong>الاشتراكات:</strong> {t('sidebar.player.subscriptions')}</p>
                    <p><strong>حالة الاشتراك:</strong> {t('sidebar.player.subscriptionStatus')}</p>
                  </div>
                </div>

                {/* قائمة النادي */}
                <div className="border rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">قائمة النادي / Club Menu</h2>
                  <div className="space-y-2">
                    <p><strong>الرئيسية:</strong> {t('sidebar.club.home')}</p>
                    <p><strong>الملف الشخصي:</strong> {t('sidebar.club.profile')}</p>
                    <p><strong>البحث عن اللاعبين:</strong> {t('sidebar.club.searchPlayers')}</p>
                    <p><strong>اللاعبين:</strong> {t('sidebar.club.players')}</p>
                    <p><strong>الفيديوهات:</strong> {t('sidebar.club.videos')}</p>
                    <p><strong>فيديوهات اللاعبين:</strong> {t('sidebar.club.playerVideos')}</p>
                    <p><strong>الإحصائيات:</strong> {t('sidebar.club.stats')}</p>
                    <p><strong>المالية:</strong> {t('sidebar.club.finances')}</p>
                  </div>
                </div>

                {/* قائمة الوكيل */}
                <div className="border rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">قائمة الوكيل / Agent Menu</h2>
                  <div className="space-y-2">
                    <p><strong>الرئيسية:</strong> {t('sidebar.agent.home')}</p>
                    <p><strong>الملف الشخصي:</strong> {t('sidebar.agent.profile')}</p>
                    <p><strong>اللاعبين:</strong> {t('sidebar.agent.players')}</p>
                    <p><strong>الأندية:</strong> {t('sidebar.agent.clubs')}</p>
                    <p><strong>التفاوضات:</strong> {t('sidebar.agent.negotiations')}</p>
                    <p><strong>العقود:</strong> {t('sidebar.agent.contracts')}</p>
                    <p><strong>العمولات:</strong> {t('sidebar.agent.commissions')}</p>
                    <p><strong>الإحصائيات:</strong> {t('sidebar.agent.stats')}</p>
                  </div>
                </div>

                {/* قائمة الأكاديمية */}
                <div className="border rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">قائمة الأكاديمية / Academy Menu</h2>
                  <div className="space-y-2">
                    <p><strong>الرئيسية:</strong> {t('sidebar.academy.home')}</p>
                    <p><strong>الملف الشخصي:</strong> {t('sidebar.academy.profile')}</p>
                    <p><strong>اللاعبين:</strong> {t('sidebar.academy.students')}</p>
                    <p><strong>الدورات:</strong> {t('sidebar.academy.courses')}</p>
                    <p><strong>الفيديوهات:</strong> {t('sidebar.academy.videos')}</p>
                    <p><strong>المدربين:</strong> {t('sidebar.academy.trainers')}</p>
                    <p><strong>الإحصائيات:</strong> {t('sidebar.academy.stats')}</p>
                    <p><strong>المالية:</strong> {t('sidebar.academy.finances')}</p>
                  </div>
                </div>

                {/* قائمة المدرب */}
                <div className="border rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">قائمة المدرب / Trainer Menu</h2>
                  <div className="space-y-2">
                    <p><strong>الرئيسية:</strong> {t('sidebar.trainer.home')}</p>
                    <p><strong>الملف الشخصي:</strong> {t('sidebar.trainer.profile')}</p>
                    <p><strong>الجلسات:</strong> {t('sidebar.trainer.sessions')}</p>
                    <p><strong>اللاعبين:</strong> {t('sidebar.trainer.players')}</p>
                    <p><strong>الفيديوهات:</strong> {t('sidebar.trainer.videos')}</p>
                    <p><strong>البرامج:</strong> {t('sidebar.trainer.programs')}</p>
                    <p><strong>الإحصائيات:</strong> {t('sidebar.trainer.stats')}</p>
                  </div>
                </div>

                {/* العناصر المشتركة */}
                <div className="border rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">العناصر المشتركة / Common Items</h2>
                  <div className="space-y-2">
                    <p><strong>الرسائل:</strong> {t('sidebar.common.messages')}</p>
                    <p><strong>تسجيل الخروج:</strong> {t('sidebar.common.logout')}</p>
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
      </div>
    </div>
  );
} 