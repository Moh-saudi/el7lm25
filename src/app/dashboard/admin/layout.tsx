'use client';

import React from 'react';
import UnifiedDashboardLayout from '@/components/layout/UnifiedDashboardLayout';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <UnifiedDashboardLayout
      accountType="admin"
      title="لوحة تحكم المدير"
      logo="/admin-avatar.png"
      showFooter={false}
      showFloatingChat={false}
    >
      {children}
    </UnifiedDashboardLayout>
  );
} 
