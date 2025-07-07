'use client';

import React, { useEffect } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';

export function Providers({ children }: { children: React.ReactNode }) {
  // تم تعطيل التحسينات مؤقتاً لاختبار webpack issue
  // useEffect(() => {
  //   // تهيئة تحسينات الأداء بعد تحميل المكونات
  //   const initializeOptimizations = async () => {
  //     try {
  //       const { initializeConsoleOptimization } = await import('@/lib/console-performance');
  //       const { initializeUrlValidation } = await import('@/lib/utils/url-validator');
  //       const { initializeSecureConsole } = await import('@/lib/utils/secure-console');
        
  //       // تأخير التهيئة للتأكد من تحميل webpack بالكامل
  //       setTimeout(() => {
  //         initializeConsoleOptimization();
  //         initializeUrlValidation();
  //         initializeSecureConsole();
  //       }, 100);
  //     } catch (error) {
  //       console.warn('Failed to initialize optimizations:', error);
  //     }
  //   };

  //   initializeOptimizations();
  // }, []);

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
} 
