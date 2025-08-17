'use client';

import React from 'react';
import ModernUnifiedDashboardLayout from '@/components/layout/ModernUnifiedDashboardLayout';

interface AgentLayoutProps {
  children: React.ReactNode;
}

export default function AgentLayout({ children }: AgentLayoutProps) {
  return (
    <ModernUnifiedDashboardLayout
      accountType="agent"
      title="لوحة تحكم الوكيل"
      showFooter={true}
      showFloatingChat={true}
      showSearch={true}
      searchPlaceholder="ابحث عن اللاعبين والصفقات..."
    >
      {children}
    </ModernUnifiedDashboardLayout>
  );
} 
