'use client';

import React from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import AgentSidebar from '@/components/layout/AgentSidebar';
import AgentFooter from '@/components/layout/AgentFooter';
import DashboardFontWrapper from '@/components/layout/DashboardFontWrapper';
import FloatingChatWidget from '@/components/support/FloatingChatWidget';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface AgentLayoutProps {
  children: React.ReactNode;
}

export default function AgentLayout({ children }: AgentLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  
  // إخفاء القائمة الجانبية والهيدر في صفحة الوكيل عند فتحها من البحث
  const isProfilePage = pathname.includes('/profile') || pathname.includes('/search/profile/agent');
  
  return (
    <DashboardFontWrapper className="bg-gray-50 dark:bg-gray-900">
      {!isProfilePage && (
        <UnifiedHeader 
          variant="default"
          showLanguageSwitcher={true}
          showNotifications={true}
          showUserMenu={true}
          title="لوحة تحكم الوكيل"
          logo="/agent-avatar.png"
        />
      )}
      <div className="flex flex-1 pt-16">
        {!isProfilePage && (
          <AgentSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        )}
        <main className={`flex-1 p-4 ${isProfilePage ? 'w-full' : ''}`}>
          {children}
        </main>
      </div>
      {!isProfilePage && <AgentFooter />}
      <FloatingChatWidget />
    </DashboardFontWrapper>
  );
} 
