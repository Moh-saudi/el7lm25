'use client';

import React from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import PlayerSidebar from '@/components/layout/PlayerSidebar';
import DashboardFontWrapper from '@/components/layout/DashboardFontWrapper';
import FloatingChatWidget from '@/components/support/FloatingChatWidget';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface PlayerLayoutProps {
  children: React.ReactNode;
}

export default function PlayerLayout({ children }: PlayerLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  
  // إخفاء القائمة الجانبية في صفحة التقارير
  const isReportsPage = pathname.includes('/reports');
  
  // إخفاء القائمة الجانبية في صفحة عرض الكيانات من البحث
  const isEntityProfilePage = pathname.includes('/search/profile/');
  
  return (
    <DashboardFontWrapper className="bg-gray-50 dark:bg-gray-900">
      {/* UnifiedHeader */}
      {!isReportsPage && !isEntityProfilePage && (
        <UnifiedHeader 
          variant="default"
          showLanguageSwitcher={true}
          showNotifications={true}
          showUserMenu={true}
          title="لوحة تحكم اللاعب"
          logo="/player-avatar.png"
        />
      )}
      <div className="flex flex-1 pt-16">
        {!isReportsPage && !isEntityProfilePage && (
          <PlayerSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        )}
        <main className={`flex-1 p-4 ${isReportsPage || isEntityProfilePage ? 'w-full' : ''}`}>
          {children}
        </main>
      </div>
      <FloatingChatWidget />
    </DashboardFontWrapper>
  );
} 
