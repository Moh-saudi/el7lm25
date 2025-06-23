'use client';

import DashboardLayoutOptimized from '@/components/layout/DashboardLayoutOptimized';
import { useSearchParams } from 'next/navigation';
import { usePathname } from 'next/navigation';

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // إذا كانت صفحة التقرير مع معامل view، نعرضها بدون layout
  const isViewingOtherPlayer = pathname === '/dashboard/player/reports' && searchParams?.get('view');
  
  if (isViewingOtherPlayer) {
    return <>{children}</>;
  }
  
  return <DashboardLayoutOptimized>{children}</DashboardLayoutOptimized>;
} 