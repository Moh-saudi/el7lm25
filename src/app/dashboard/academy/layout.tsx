'use client';

import React from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import AcademySidebar from '@/components/layout/AcademySidebar';
import AcademyFooter from '@/components/layout/AcademyFooter';
import DashboardFontWrapper from '@/components/layout/DashboardFontWrapper';
import FloatingChatWidget from '@/components/support/FloatingChatWidget';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface AcademyLayoutProps {
  children: React.ReactNode;
}

export default function AcademyLayout({ children }: AcademyLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  
  // إخفاء القائمة الجانبية والهيدر في صفحة الأكاديمية عند فتحها من البحث
  const isProfilePage = pathname.includes('/profile') || pathname.includes('/search/profile/academy');
  
  return (
    <DashboardFontWrapper className="bg-gray-50 dark:bg-gray-900">
      {!isProfilePage && (
        <UnifiedHeader 
          variant="default"
          showLanguageSwitcher={true}
          showNotifications={true}
          showUserMenu={true}
          title="لوحة تحكم الأكاديمية"
          logo="/academy-avatar.png"
        />
      )}
      <div className="flex flex-1 pt-16">
        {!isProfilePage && (
          <AcademySidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        )}
        <main className={`flex-1 p-4 ${isProfilePage ? 'w-full' : ''}`}>
          {children}
        </main>
      </div>
      {!isProfilePage && <AcademyFooter />}
      <FloatingChatWidget />
    </DashboardFontWrapper>
  );
} 
