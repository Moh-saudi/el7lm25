'use client';

import React, { useState } from 'react';
import ClubSidebar from '@/components/layout/ClubSidebar';
import ClubHeader from '@/components/layout/ClubHeader';
import ClubFooter from '@/components/layout/ClubFooter';

interface ClubLayoutProps {
  children: React.ReactNode;
}

export default function ClubLayout({ children }: ClubLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <ClubHeader />
      <div className="flex flex-1">
        <ClubSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className="flex-1 transition-all duration-300 p-4 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
      <ClubFooter />
    </div>
  );
} 
