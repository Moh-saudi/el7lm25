'use client';

import React, { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import ClubSidebar from '@/components/layout/ClubSidebar';
import ClubHeader from '@/components/layout/ClubHeader';
import ClubFooter from '@/components/layout/ClubFooter';

// استيراد DashboardLayout بشكل ديناميكي
const DashboardLayout = dynamic(
  () => import('@/components/layout/DashboardLayout'),
  {
    loading: () => <div>جاري تحميل لوحة التحكم...</div>,
    ssr: false
  }
);

interface ClubLayoutProps {
  children: React.ReactNode;
}

export default function ClubLayout({ children }: ClubLayoutProps) {
  // حالة الطي للسايدبار (تمريرها للسايدبار)
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <ClubHeader />
      <div className="flex flex-1">
        {/* Sidebar غير ثابت */}
        <ClubSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        {/* Main content */}
        <main
          className={
            `flex-1 transition-all duration-300 p-4 bg-gray-50 dark:bg-gray-900`
          }
        >
          {children}
        </main>
      </div>
      <ClubFooter />
    </div>
  );
} 