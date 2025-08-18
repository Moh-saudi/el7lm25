'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/firebase/auth-provider';
import { TranslationProvider } from '@/lib/translations/simple-context';
import { MantineProvider } from '@mantine/core';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <MantineProvider>
      <TranslationProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </TranslationProvider>
    </MantineProvider>
  );
} 
