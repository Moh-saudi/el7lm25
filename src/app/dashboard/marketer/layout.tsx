'use client';

import React from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import DashboardFontWrapper from '@/components/layout/DashboardFontWrapper';
import FloatingChatWidget from '@/components/support/FloatingChatWidget';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface MarketerLayoutProps {
  children: React.ReactNode;
}

export default function MarketerLayout({ children }: MarketerLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  
  // إخفاء القائمة الجانبية والهيدر في صفحة المسوق عند فتحها من البحث
  const isProfilePage = pathname.includes('/profile') || pathname.includes('/search/profile/marketer');
  
  return (
    <DashboardFontWrapper className="bg-gray-50 dark:bg-gray-900">
      {!isProfilePage && (
        <UnifiedHeader 
          variant="default"
          showLanguageSwitcher={true}
          showNotifications={true}
          showUserMenu={true}
          title="لوحة تحكم المسوق"
          logo="/marketer-avatar.png"
        />
      )}
      <div className="flex flex-1 pt-16">
        {/* سيتم إضافة MarketerSidebar لاحقاً */}
        <main className={`flex-1 p-4 ${isProfilePage ? 'w-full' : ''}`}>
          {children}
        </main>
      </div>
      <FloatingChatWidget />
    </DashboardFontWrapper>
  );
} 