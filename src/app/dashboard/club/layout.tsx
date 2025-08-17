'use client';

import React from 'react';
import ModernUnifiedDashboardLayout from '@/components/layout/ModernUnifiedDashboardLayout';

interface ClubLayoutProps {
  children: React.ReactNode;
}

export default function ClubLayout({ children }: ClubLayoutProps) {
  return (
    <ModernUnifiedDashboardLayout
      accountType="club"
      title="لوحة تحكم النادي"
      showFooter={true}
      showFloatingChat={true}
      showSearch={true}
      searchPlaceholder="ابحث عن اللاعبين والمدربين..."
    >
      {children}
    </ModernUnifiedDashboardLayout>
  );
} 
