'use client';

import React from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import ClubSidebar from '@/components/layout/ClubSidebar';
import ClubFooter from '@/components/layout/ClubFooter';
import DashboardFontWrapper from '@/components/layout/DashboardFontWrapper';
import FloatingChatWidget from '@/components/support/FloatingChatWidget';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface ClubLayoutProps {
  children: React.ReactNode;
}

export default function ClubLayout({ children }: ClubLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  
  // إخفاء القائمة الجانبية والهيدر في صفحة النادي عند فتحها من البحث
  const isProfilePage = pathname.includes('/profile') || pathname.includes('/search/profile/club');
  
  return (
    <DashboardFontWrapper className="bg-gray-50 dark:bg-gray-900">
      {!isProfilePage && (
        <UnifiedHeader 
          variant="default"
          showLanguageSwitcher={true}
          showNotifications={true}
          showUserMenu={true}
          title="لوحة تحكم النادي"
          logo="/club-avatar.png"
        />
      )}
      <div className="flex flex-1 pt-16">
        {!isProfilePage && (
          <ClubSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        )}
        <main className={`flex-1 p-4 ${isProfilePage ? 'w-full' : ''}`}>
          {children}
        </main>
      </div>
      {!isProfilePage && <ClubFooter />}
      <FloatingChatWidget />
    </DashboardFontWrapper>
  );
} 
