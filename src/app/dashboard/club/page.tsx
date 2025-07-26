'use client';

import React, { memo } from 'react';
import { useTranslation } from '@/lib/translations/simple-context';

const WelcomeHero = memo(() => {
  const { t } = useTranslation();
  
  return (
    <div className="text-center py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('dashboard.club.welcome.title')}
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          {t('dashboard.club.welcome.subtitle')}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">{t('dashboard.club.features.players')}</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">{t('dashboard.club.features.performance')}</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">{t('dashboard.club.features.contracts')}</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">{t('dashboard.club.features.communication')}</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">{t('dashboard.club.cta.title')}</h2>
          <p className="text-lg mb-6">
            {t('dashboard.club.cta.description')}
          </p>
          
          <div className="flex justify-center gap-4 mt-6">
            <a href="https://www.facebook.com/hagzz" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 hover:scale-110">
              <img src="/images/medialogo/facebook.svg" alt={t('social.facebook')} width={24} height={24} />
            </a>
            <a href="https://www.instagram.com/hagzzel7lm?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 hover:scale-110">
              <img src="/images/medialogo/instagram.svg" alt={t('social.instagram')} width={24} height={24} />
            </a>
            <a href="https://www.linkedin.com/company/hagzz" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 hover:scale-110">
              <img src="/images/medialogo/linkedin.svg" alt={t('social.linkedin')} width={24} height={24} />
            </a>
            <a href="https://www.tiktok.com/@hagzz25?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 hover:scale-110">
              <img src="/images/medialogo/tiktok.svg" alt={t('social.tiktok')} width={24} height={24} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

WelcomeHero.displayName = 'WelcomeHero';

export default function ClubDashboard() {
  return <WelcomeHero />;
} 
