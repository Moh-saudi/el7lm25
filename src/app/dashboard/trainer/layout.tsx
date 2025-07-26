'use client';

import React from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import TrainerSidebar from '@/components/layout/TrainerSidebar';
import TrainerFooter from '@/components/layout/TrainerFooter';
import DashboardFontWrapper from '@/components/layout/DashboardFontWrapper';
import FloatingChatWidget from '@/components/support/FloatingChatWidget';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface TrainerLayoutProps {
  children: React.ReactNode;
}

export default function TrainerLayout({ children }: TrainerLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  
  // إخفاء القائمة الجانبية والهيدر في صفحة المدرب عند فتحها من البحث
  const isProfilePage = pathname.includes('/profile') || pathname.includes('/search/profile/trainer');
  
  return (
    <DashboardFontWrapper className="bg-gray-50 dark:bg-gray-900">
      {!isProfilePage && (
        <UnifiedHeader 
          variant="default"
          showLanguageSwitcher={true}
          showNotifications={true}
          showUserMenu={true}
          title="لوحة تحكم المدرب"
          logo="/trainer-avatar.png"
        />
      )}
      <div className="flex flex-1 pt-16">
        {!isProfilePage && (
          <TrainerSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        )}
        <main className={`flex-1 p-4 ${isProfilePage ? 'w-full' : ''}`}>
          {children}
        </main>
      </div>
      {!isProfilePage && <TrainerFooter />}
      <FloatingChatWidget />
    </DashboardFontWrapper>
  );
} 
