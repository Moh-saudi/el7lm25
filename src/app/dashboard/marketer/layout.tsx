'use client';

import React from 'react';
import UnifiedDashboardLayout from '@/components/layout/UnifiedDashboardLayout';

interface MarketerLayoutProps {
  children: React.ReactNode;
}

export default function MarketerLayout({ children }: MarketerLayoutProps) {
  return (
    <UnifiedDashboardLayout
      accountType="marketer"
      title="لوحة تحكم المسوق"
      logo="/marketer-avatar.png"
      showFooter={false}
      showFloatingChat={true}
    >
      {children}
    </UnifiedDashboardLayout>
  );
} 