'use client';

import React from 'react';
import { useTranslation } from '@/lib/translations/simple-context';
import LanguageSwitcher from './LanguageSwitcher';

export default function HeaderWithTranslation() {
  const { t, language, direction } = useTranslation();

  return (
    <header className={`bg-white shadow-sm border-b ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900">
                El7hm
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8 rtl:space-x-reverse">
            <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              {t('nav.home')}
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              {t('nav.about')}
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              {t('nav.contact')}
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Language Switcher */}
            <LanguageSwitcher variant="minimal" showFlags={true} showNames={false} />
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                {t('nav.login')}
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                {t('nav.register')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 