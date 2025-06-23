'use client';

import React, { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import AgentSidebar from '@/components/layout/AgentSidebar';
import AgentHeader from '@/components/layout/AgentHeader';
import AgentFooter from '@/components/layout/AgentFooter';

// استيراد DashboardLayout بشكل ديناميكي
const DashboardLayout = dynamic(
  () => import('@/components/layout/DashboardLayout'),
  {
    loading: () => <div>جاري تحميل لوحة التحكم...</div>,
    ssr: false
  }
);

interface AgentLayoutProps {
  children: React.ReactNode;
}

export default function AgentLayout({ children }: AgentLayoutProps) {
  // حالة الطي للسايدبار (تمريرها للسايدبار)
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <AgentHeader />
      <div className="flex flex-1">
        {/* Sidebar غير ثابت */}
        <AgentSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        {/* Main content */}
        <main
          className={
            `flex-1 transition-all duration-300 p-4 bg-gray-50 dark:bg-gray-900`
          }
        >
          {children}
        </main>
      </div>
      <AgentFooter />
    </div>
  );
} 