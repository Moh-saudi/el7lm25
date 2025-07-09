'use client';

import React from 'react';
import AcademyHeader from '@/components/layout/AcademyHeader';
import AcademySidebar from '@/components/layout/AcademySidebar';
import AcademyFooter from '@/components/layout/AcademyFooter';
import { useState } from 'react';

interface AcademyLayoutProps {
  children: React.ReactNode;
}

export default function AcademyLayout({ children }: AcademyLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <AcademyHeader />
      <div className="flex flex-1 pt-16">
        <AcademySidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className="flex-1 p-4">{children}</main>
      </div>
      <AcademyFooter />
    </div>
  );
} 
