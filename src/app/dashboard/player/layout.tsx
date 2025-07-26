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
  
  // إخفاء الهيدر والسايدبار للصفحات التي لا تحتاجها
  const isReportsPage = pathname.includes('/reports');
  const isEntityProfilePage = pathname.includes('/search/profile/');
  const isMainDashboard = pathname === '/dashboard/player' || pathname === '/dashboard/player/';
  
  return (
    <DashboardFontWrapper className="bg-gray-50 dark:bg-gray-900">
      {/* إظهار الهيدر فقط للصفحة الرئيسية */}
      {isMainDashboard && (
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
        {/* إظهار السايدبار فقط للصفحة الرئيسية */}
        {isMainDashboard && (
          <PlayerSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        )}
        
        <main className={`flex-1 p-4 ${isReportsPage || isEntityProfilePage || !isMainDashboard ? 'w-full' : ''}`}>
          {children}
        </main>
      </div>
      
      <FloatingChatWidget />
    </DashboardFontWrapper>
  );
} 
