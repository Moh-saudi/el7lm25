'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

// استيراد المكونات بشكل ديناميكي
const Header = dynamic(() => import('./Header'), {
  loading: () => <div>جاري تحميل الهيدر...</div>,
  ssr: false
});

const Sidebar = dynamic(() => import('./Sidebar'), {
  loading: () => <div>جاري تحميل القائمة الجانبية...</div>,
  ssr: false
});

const Footer = dynamic(() => import('./Footer'), {
  loading: () => <div>جاري تحميل الفوتر...</div>,
  ssr: false
});

const SidebarProvider = dynamic(() => import('@/lib/context/SidebarContext').then(mod => mod.SidebarProvider), {
  loading: () => <div>جاري تحميل القائمة الجانبية...</div>,
  ssr: false
});

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  // Check if the current path is a dashboard path
  const isDashboardPath = pathname.startsWith('/dashboard');

  // If not a dashboard path, render only the children
  if (!isDashboardPath) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-gray-50" style={{ direction: 'rtl' }}>
        <Suspense fallback={<div>جاري تحميل الهيدر...</div>}>
          <Header />
        </Suspense>
        <div className="flex flex-1 min-h-0 pt-16" style={{ direction: 'ltr' }}>
          <Suspense fallback={<div>جاري تحميل القائمة الجانبية...</div>}>
            <Sidebar />
          </Suspense>
          <main 
            className="flex-1 min-h-0 overflow-auto transition-all duration-300 ease-in-out"
            style={{ direction: 'rtl' }}
          >
            <div className="w-full max-w-full p-6 mx-auto">
              <div className="min-h-full p-6 bg-white rounded-lg shadow-sm">
                {children}
              </div>
            </div>
          </main>
        </div>
        <Suspense fallback={<div>جاري تحميل الفوتر...</div>}>
          <Footer />
        </Suspense>
      </div>
    </SidebarProvider>
  );
} 