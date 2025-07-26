'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/translations/simple-context';

export default function AdminFooter() {
  const year = new Date().getFullYear();
  const { t, language } = useTranslation();
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 px-4 mt-auto" style={{ direction: dir }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        {/* الشعار والاسم */}
        <div className="flex items-center space-x-2 space-x-reverse">
          <img 
            src="/el7hm-logo.png" 
            alt="الحلم el7hm Logo" 
            className="h-8 w-8"
          />
          <div className="flex flex-col">
            <span className="font-bold text-gray-800 dark:text-gray-200">الحلم el7hm</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">© {year} الحلم el7hm</span>
          </div>
        </div>

        {/* روابط التنقل */}
        <div className="flex gap-6 text-sm">
          <Link href="/about" className="text-gray-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-300 transition-colors">
            {t('admin.footer.about')}
          </Link>
          <Link href="/contact" className="text-gray-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-300 transition-colors">
            {t('admin.footer.contact')}
          </Link>
          <Link href="/privacy" className="text-gray-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-300 transition-colors">
            {t('admin.footer.privacy')}
          </Link>
        </div>

        {/* أيقونات السوشيال ميديا */}
        <div className="flex items-center space-x-4 space-x-reverse">
          <a 
            href="https://www.facebook.com/profile.php?id=61577797509887" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-600 transition-colors"
            title="Facebook"
          >
            <img src="/images/medialogo/facebook.svg" alt="Facebook" width={20} height={20} />
          </a>
          <a 
            href="https://www.instagram.com/hagzzel7lm/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-pink-600 transition-colors"
            title="Instagram"
          >
            <img src="/images/medialogo/instagram.svg" alt="Instagram" width={20} height={20} />
          </a>
          <a 
            href="https://www.linkedin.com/company/hagzz" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-700 transition-colors"
            title="LinkedIn"
          >
            <img src="/images/medialogo/linkedin.svg" alt="LinkedIn" width={20} height={20} />
          </a>
          <a 
            href="https://www.tiktok.com/@hagzz25?is_from_webapp=1&sender_device=pc" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-black transition-colors"
            title="TikTok"
          >
            <img src="/images/medialogo/tiktok.svg" alt="TikTok" width={20} height={20} />
          </a>
        </div>
      </div>
    </footer>
  );
} 