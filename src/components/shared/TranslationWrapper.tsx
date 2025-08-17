'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/translations/simple-context';

interface TranslationWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function TranslationWrapper({ 
  children, 
  fallback = <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50"></div> 
}: TranslationWrapperProps) {
  const { language } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show fallback until client-side hydration is complete
  if (!isClient) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
} 