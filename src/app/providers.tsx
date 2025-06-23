'use client';

import React from 'react';
import '@/lib/console-performance';
import '@/lib/utils/url-validator';
import { ErrorBoundary } from '@/components/error-boundary';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
} 