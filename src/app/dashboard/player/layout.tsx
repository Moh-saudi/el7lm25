'use client';

import React from 'react';
import ModernUnifiedDashboardLayout from '@/components/layout/ModernUnifiedDashboardLayout';

interface PlayerLayoutProps {
  children: React.ReactNode;
}

export default function PlayerLayout({ children }: PlayerLayoutProps) {
  return (
    <ModernUnifiedDashboardLayout
      accountType="player"
      title="لوحة تحكم اللاعب"
      showFooter={true}
      showFloatingChat={true}
      showSearch={true}
      searchPlaceholder="ابحث عن الأندية والوكلاء..."
    >
      {children}
    </ModernUnifiedDashboardLayout>
  );
}
