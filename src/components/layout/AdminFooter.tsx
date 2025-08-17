'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/translations/simple-context';

export default function AdminFooter() {
  const year = new Date().getFullYear();
  const { t, language } = useTranslation();
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <footer className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-4 mt-auto shadow-lg" style={{ direction: dir }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        {/* الشعار والاسم */}
        <div className="flex items-center space-x-3 space-x-reverse">
          <img 
            src="/el7hm-logo.png" 
            alt={t('admin.footer.logoAlt')} 
            className="h-10 w-10 drop-shadow-sm"
          />
          <div className="flex flex-col">
            <span className="font-bold text-gray-800 dark:text-gray-200 text-lg">{t('admin.footer.companyName')}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('admin.footer.copyright', { year })}</span>
          </div>
        </div>

        {/* روابط التنقل */}
        <div className="flex gap-6 text-sm">
          <Link 
            href="/about" 
            className="text-gray-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-300 transition-colors font-medium"
          >
            {t('admin.footer.about')}
          </Link>
          <Link 
            href="/contact" 
            className="text-gray-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-300 transition-colors font-medium"
          >
            {t('admin.footer.contact')}
          </Link>
          <Link 
            href="/privacy" 
            className="text-gray-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-300 transition-colors font-medium"
          >
            {t('admin.footer.privacy')}
          </Link>
        </div>

        {/* أيقونات السوشيال ميديا */}
        <div className="flex items-center space-x-3 space-x-reverse">
          <a 
            href="https://www.facebook.com/profile.php?id=61577797509887" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title={t('admin.footer.facebook')}
          >
            <img 
              src="/images/medialogo/facebook.svg" 
              alt={t('admin.footer.facebook')} 
              width={22} 
              height={22} 
              className="drop-shadow-sm"
            />
          </a>
          <a 
            href="https://www.instagram.com/hagzzel7lm/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-pink-600 transition-colors p-2 rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/20"
            title={t('admin.footer.instagram')}
          >
            <img 
              src="/images/medialogo/instagram.svg" 
              alt={t('admin.footer.instagram')} 
              width={22} 
              height={22} 
              className="drop-shadow-sm"
            />
          </a>
          <a 
            href="https://www.linkedin.com/company/hagzz" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-700 transition-colors p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title={t('admin.footer.linkedin')}
          >
            <img 
              src="/images/medialogo/linkedin.svg" 
              alt={t('admin.footer.linkedin')} 
              width={22} 
              height={22} 
              className="drop-shadow-sm"
            />
          </a>
          <a 
            href="https://www.tiktok.com/@hagzz25?is_from_webapp=1&sender_device=pc" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-black dark:hover:text-white transition-colors p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800"
            title={t('admin.footer.tiktok')}
          >
            <img 
              src="/images/medialogo/tiktok.svg" 
              alt={t('admin.footer.tiktok')} 
              width={22} 
              height={22} 
              className="drop-shadow-sm"
            />
          </a>
        </div>
      </div>
    </footer>
  );
} 