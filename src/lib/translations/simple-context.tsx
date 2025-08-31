'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface TranslationContextType {
  t: (key: string) => string;
  language: string;
  direction: 'ltr' | 'rtl';
  setLanguage: (lang: string) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const translations = {
  ar: {
    // الإشعارات
    'notifications.title': 'الإشعارات',
    'notifications.subtitle': 'تابع آخر التحديثات والإشعارات',
    'notifications.unread': 'غير مقروءة',
    'notifications.markAllRead': 'تحديد الكل كمقروء',
    'notifications.markRead': 'تحديد كمقروء',
    'notifications.empty.title': 'لا توجد إشعارات',
    'notifications.empty.message': 'ستظهر هنا الإشعارات الجديدة عند وصولها',
    'notifications.welcome.title': 'مرحباً بك في النظام',
    'notifications.welcome.message': 'تم تسجيل دخولك بنجاح إلى منصة الحلم',
    'notifications.system.title': 'تحديث النظام',
    'notifications.system.message': 'تم تحديث النظام بنجاح. استمتع بالميزات الجديدة!',
    
    // القائمة الجانبية - اللاعب
    'sidebar.player.home': 'الرئيسية',
    'sidebar.player.profile': 'الملف الشخصي',
    'sidebar.player.reports': 'التقارير',
    'sidebar.player.referrals': 'الإحالات',
    'sidebar.player.store': 'المتجر',
    'sidebar.player.academy': 'الأكاديمية',
    'sidebar.player.videos': 'الفيديوهات',
    'sidebar.player.uploadVideos': 'رفع فيديوهات',
    'sidebar.player.playerVideos': 'فيديوهات اللاعب',
    'sidebar.player.search': 'البحث',
    'sidebar.player.stats': 'الإحصائيات',
    'sidebar.player.subscriptions': 'الاشتراكات',
    'sidebar.player.subscriptionStatus': 'حالة الاشتراك',
    'sidebar.player.notifications': 'الإشعارات',
    
    // القائمة الجانبية - النادي
    'sidebar.club.home': 'الرئيسية',
    'sidebar.club.profile': 'الملف الشخصي',
    'sidebar.club.searchPlayers': 'البحث عن اللاعبين',
    'sidebar.club.players': 'اللاعبين',
    'sidebar.club.videos': 'الفيديوهات',
    'sidebar.club.playerVideos': 'فيديوهات اللاعبين',
    'sidebar.club.stats': 'الإحصائيات',
    'sidebar.club.finances': 'المالية',
    
    // القائمة الجانبية - الوكيل
    'sidebar.agent.home': 'الرئيسية',
    'sidebar.agent.profile': 'الملف الشخصي',
    'sidebar.agent.players': 'اللاعبين',
    'sidebar.agent.clubs': 'الأندية',
    'sidebar.agent.negotiations': 'التفاوضات',
    'sidebar.agent.contracts': 'العقود',
    'sidebar.agent.commissions': 'العمولات',
    'sidebar.agent.stats': 'الإحصائيات',
    
    // القائمة الجانبية - الأكاديمية
    'sidebar.academy.home': 'الرئيسية',
    'sidebar.academy.profile': 'الملف الشخصي',
    'sidebar.academy.players': 'اللاعبين',
    'sidebar.academy.courses': 'الدورات',
    'sidebar.academy.videos': 'الفيديوهات',
    'sidebar.academy.trainers': 'المدربين',
    'sidebar.academy.stats': 'الإحصائيات',
    'sidebar.academy.finances': 'المالية',
    
    // القائمة الجانبية - المدرب
    'sidebar.trainer.home': 'الرئيسية',
    'sidebar.trainer.profile': 'الملف الشخصي',
    'sidebar.trainer.sessions': 'الجلسات',
    'sidebar.trainer.players': 'اللاعبين',
    'sidebar.trainer.videos': 'الفيديوهات',
    'sidebar.trainer.programs': 'البرامج',
    'sidebar.trainer.stats': 'الإحصائيات',
    
    // القائمة الجانبية - المشتركة
    'sidebar.common.messages': 'الرسائل',
    'sidebar.common.logout': 'تسجيل الخروج',
    
    // القائمة الجانبية - المسوق
    'sidebar.marketer.home': 'الرئيسية',
    'sidebar.marketer.profile': 'الملف الشخصي',
    'sidebar.marketer.players': 'اللاعبين',
    'sidebar.marketer.search': 'البحث',
    'sidebar.marketer.videos': 'الفيديوهات',
    'sidebar.marketer.dreamAcademy': 'أكاديمية الحلم',
    'sidebar.marketer.payment': 'الدفع',
    'sidebar.marketer.subscription': 'الاشتراك',
    'sidebar.marketer.notifications': 'الإشعارات',
    'sidebar.marketer.subscriptionStatus': 'حالة الاشتراك',
    'sidebar.marketer.billing': 'الفواتير',
  },
  en: {
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.subtitle': 'Stay updated with the latest notifications',
    'notifications.unread': 'unread',
    'notifications.markAllRead': 'Mark All as Read',
    'notifications.markRead': 'Mark as Read',
    'notifications.empty.title': 'No notifications',
    'notifications.empty.message': 'New notifications will appear here when they arrive',
    'notifications.welcome.title': 'Welcome to the system',
    'notifications.welcome.message': 'You have successfully logged into the Dream platform',
    'notifications.system.title': 'System Update',
    'notifications.system.message': 'The system has been updated successfully. Enjoy the new features!',
    
    // Sidebar - Player
    'sidebar.player.home': 'Home',
    'sidebar.player.profile': 'Profile',
    'sidebar.player.reports': 'Reports',
    'sidebar.player.referrals': 'Referrals',
    'sidebar.player.store': 'Store',
    'sidebar.player.academy': 'Academy',
    'sidebar.player.videos': 'Videos',
    'sidebar.player.uploadVideos': 'Upload Videos',
    'sidebar.player.playerVideos': 'Player Videos',
    'sidebar.player.search': 'Search',
    'sidebar.player.stats': 'Statistics',
    'sidebar.player.subscriptions': 'Subscriptions',
    'sidebar.player.subscriptionStatus': 'Subscription Status',
    'sidebar.player.notifications': 'Notifications',
    
    // Sidebar - Club
    'sidebar.club.home': 'Home',
    'sidebar.club.profile': 'Profile',
    'sidebar.club.searchPlayers': 'Search Players',
    'sidebar.club.players': 'Players',
    'sidebar.club.videos': 'Videos',
    'sidebar.club.playerVideos': 'Player Videos',
    'sidebar.club.stats': 'Statistics',
    'sidebar.club.finances': 'Finances',
    
    // Sidebar - Agent
    'sidebar.agent.home': 'Home',
    'sidebar.agent.profile': 'Profile',
    'sidebar.agent.players': 'Players',
    'sidebar.agent.clubs': 'Clubs',
    'sidebar.agent.negotiations': 'Negotiations',
    'sidebar.agent.contracts': 'Contracts',
    'sidebar.agent.commissions': 'Commissions',
    'sidebar.agent.stats': 'Statistics',
    
    // Sidebar - Academy
    'sidebar.academy.home': 'Home',
    'sidebar.academy.profile': 'Profile',
    'sidebar.academy.players': 'Players',
    'sidebar.academy.courses': 'Courses',
    'sidebar.academy.videos': 'Videos',
    'sidebar.academy.trainers': 'Trainers',
    'sidebar.academy.stats': 'Statistics',
    'sidebar.academy.finances': 'Finances',
    
    // Sidebar - Trainer
    'sidebar.trainer.home': 'Home',
    'sidebar.trainer.profile': 'Profile',
    'sidebar.trainer.sessions': 'Sessions',
    'sidebar.trainer.players': 'Players',
    'sidebar.trainer.videos': 'Videos',
    'sidebar.trainer.programs': 'Programs',
    'sidebar.trainer.stats': 'Statistics',
    
    // Sidebar - Common
    'sidebar.common.messages': 'Messages',
    'sidebar.common.logout': 'Logout',
    
    // Sidebar - Marketer
    'sidebar.marketer.home': 'Home',
    'sidebar.marketer.profile': 'Profile',
    'sidebar.marketer.players': 'Players',
    'sidebar.marketer.search': 'Search',
    'sidebar.marketer.videos': 'Videos',
    'sidebar.marketer.dreamAcademy': 'Dream Academy',
    'sidebar.marketer.payment': 'Payment',
    'sidebar.marketer.subscription': 'Subscription',
    'sidebar.marketer.notifications': 'Notifications',
    'sidebar.marketer.subscriptionStatus': 'Subscription Status',
    'sidebar.marketer.billing': 'Billing',
  }
};

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState('ar');
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('rtl');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'ar';
    setLanguageState(savedLanguage);
    setDirection(savedLanguage === 'ar' ? 'rtl' : 'ltr');
  }, []);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    setDirection(lang === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('language', lang);
    // إعادة تحميل الصفحة لتطبيق التغييرات
    window.location.reload();
  };

  const t = (key: string): string => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations.ar] || key;
  };

  return (
    <TranslationContext.Provider value={{ t, language, direction, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
