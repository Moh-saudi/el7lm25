'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/firebase/auth-provider';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return <AuthProvider>{children}</AuthProvider>;
} 