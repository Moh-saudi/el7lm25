'use client';

import React from 'react';
import { useTranslation } from '@/lib/translations/simple-context';
import LanguageSwitcher from './LanguageSwitcher';

export default function TranslatedComponent() {
  const { 
    t, 
    tWithVars, 
    language, 
    direction, 
    formatDate, 
    formatNumber, 
    formatCurrency 
  } = useTranslation();

  // مثال على استخدام الترجمة البسيطة
  const welcomeMessage = t('nav.dashboard');
  const saveButton = t('actions.save');
  const cancelButton = t('actions.cancel');

  // مثال على استخدام الترجمة مع متغيرات
  const userCount = 1500;
  const userMessage = tWithVars('users.totalUsers', { count: userCount });

  // مثال على تنسيق التاريخ
  const currentDate = formatDate(new Date());

  // مثال على تنسيق الأرقام
  const formattedNumber = formatNumber(1234567);

  // مثال على تنسيق العملة
  const formattedCurrency = formatCurrency(5000, 'USD');

  return (
    <div className={`p-6 bg-white rounded-lg shadow-lg ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
      {/* مبدل اللغة */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{t('ui.language')}</h3>
        <LanguageSwitcher variant="dropdown" />
      </div>

      {/* معلومات اللغة الحالية */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">{t('ui.currentLanguage')}</h3>
        <p><strong>{t('ui.language')}:</strong> {language}</p>
        <p><strong>{t('ui.direction')}:</strong> {direction}</p>
      </div>

      {/* أمثلة على الترجمة */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">{t('ui.examples')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">{t('ui.simpleTranslation')}</h4>
              <p><strong>Dashboard:</strong> {welcomeMessage}</p>
              <p><strong>Save:</strong> {saveButton}</p>
              <p><strong>Cancel:</strong> {cancelButton}</p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">{t('ui.translationWithVariables')}</h4>
              <p><strong>Users:</strong> {userMessage}</p>
              <p><strong>Number:</strong> {formattedNumber}</p>
              <p><strong>Currency:</strong> {formattedCurrency}</p>
            </div>
          </div>
        </div>

        {/* أزرار مترجمة */}
        <div className="flex gap-2 flex-wrap">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            {t('actions.save')}
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            {t('actions.cancel')}
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            {t('actions.approve')}
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            {t('actions.reject')}
          </button>
        </div>

        {/* قائمة التنقل المترجمة */}
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">{t('nav.navigation')}</h4>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {t('nav.dashboard')}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {t('nav.users')}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {t('nav.payments')}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {t('nav.reports')}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {t('nav.settings')}
            </span>
          </div>
        </div>

        {/* حالة النظام المترجمة */}
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">{t('system.title')}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="text-center p-2 bg-green-100 rounded">
              <div className="text-green-800 font-medium">{t('system.health.excellent')}</div>
              <div className="text-sm text-green-600">{t('system.services.firebase')}</div>
            </div>
            <div className="text-center p-2 bg-green-100 rounded">
              <div className="text-green-800 font-medium">{t('system.health.good')}</div>
              <div className="text-sm text-green-600">{t('system.services.paymentGateway')}</div>
            </div>
            <div className="text-center p-2 bg-yellow-100 rounded">
              <div className="text-yellow-800 font-medium">{t('system.health.fair')}</div>
              <div className="text-sm text-yellow-600">{t('system.services.emailService')}</div>
            </div>
            <div className="text-center p-2 bg-red-100 rounded">
              <div className="text-red-800 font-medium">{t('system.health.poor')}</div>
              <div className="text-sm text-red-600">{t('system.services.smsService')}</div>
            </div>
          </div>
        </div>

        {/* أنواع الحسابات */}
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">{t('users.types.all')}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries({
              player: t('accountTypes.player'),
              club: t('accountTypes.club'),
              agent: t('accountTypes.agent'),
              academy: t('accountTypes.academy'),
              trainer: t('accountTypes.trainer'),
              admin: t('accountTypes.admin'),
              marketer: t('accountTypes.marketer'),
              parent: t('accountTypes.parent')
            }).map(([key, value]) => (
              <div key={key} className="text-center p-2 bg-gray-100 rounded">
                <div className="text-sm font-medium">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 