'use client';

import React, { useEffect } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // تحسين معالجة الأخطاء
    if (typeof window !== 'undefined') {
      // منع أخطاء غير معالجة
      const handleError = (event: ErrorEvent) => {
        console.debug('Handled error in Providers:', event.error);
        event.preventDefault();
        return false;
      };

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        console.debug('Handled unhandled rejection in Providers:', event.reason);
        event.preventDefault();
        return false;
      };

      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }
  }, []);

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
} 
