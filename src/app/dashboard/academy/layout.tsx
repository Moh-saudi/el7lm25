'use client';

import React from 'react';
import ModernUnifiedDashboardLayout from '@/components/layout/ModernUnifiedDashboardLayout';

interface AcademyLayoutProps {
  children: React.ReactNode;
}

export default function AcademyLayout({ children }: AcademyLayoutProps) {
  return (
    <ModernUnifiedDashboardLayout
      accountType="academy"
      title="لوحة تحكم الأكاديمية"
      showFooter={true}
      showFloatingChat={true}
      showSearch={true}
      searchPlaceholder="ابحث عن اللاعبين والمدربين..."
    >
      {children}
    </ModernUnifiedDashboardLayout>
  );
} 
