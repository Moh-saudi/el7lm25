'use client';

import React, { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import AcademySidebar from '@/components/layout/AcademySidebar';
import AcademyHeader from '@/components/layout/AcademyHeader';
import AcademyFooter from '@/components/layout/AcademyFooter';

// استيراد DashboardLayout بشكل ديناميكي
const DashboardLayout = dynamic(
  () => import('@/components/layout/DashboardLayout'),
  {
    loading: () => <div>جاري تحميل لوحة التحكم...</div>,
    ssr: false
  }
);

interface AcademyLayoutProps {
  children: React.ReactNode;
}

export default function AcademyLayout({ children }: AcademyLayoutProps) {
  // حالة الطي للسايدبار (تمريرها للسايدبار)
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <AcademyHeader />
      <div className="flex flex-1">
        {/* Sidebar غير ثابت */}
        <AcademySidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        {/* Main content */}
        <main
          className={
            `flex-1 transition-all duration-300 p-4 bg-gray-50 dark:bg-gray-900`
          }
        >
          {children}
        </main>
      </div>
      <AcademyFooter />
    </div>
  );
} 