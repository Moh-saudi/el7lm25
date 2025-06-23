'use client';

import React, { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import TrainerSidebar from '@/components/layout/TrainerSidebar';
import TrainerHeader from '@/components/layout/TrainerHeader';
import TrainerFooter from '@/components/layout/TrainerFooter';

// استيراد DashboardLayout بشكل ديناميكي
const DashboardLayout = dynamic(
  () => import('@/components/layout/DashboardLayout'),
  {
    loading: () => <div>جاري تحميل لوحة التحكم...</div>,
    ssr: false
  }
);

interface TrainerLayoutProps {
  children: React.ReactNode;
}

export default function TrainerLayout({ children }: TrainerLayoutProps) {
  // حالة الطي للسايدبار (تمريرها للسايدبار)
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <TrainerHeader />
      <div className="flex flex-1">
        {/* Sidebar غير ثابت */}
        <TrainerSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        {/* Main content */}
        <main
          className={
            `flex-1 transition-all duration-300 p-4 bg-gray-50 dark:bg-gray-900`
          }
        >
          {children}
        </main>
             </div>
       <TrainerFooter />
    </div>
  );
} 