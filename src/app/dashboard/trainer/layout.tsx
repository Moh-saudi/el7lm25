'use client';

import React from 'react';
import FloatingChatWidget from '@/components/support/FloatingChatWidget';

interface TrainerLayoutProps {
  children: React.ReactNode;
}

export default function TrainerLayout({ children }: TrainerLayoutProps) {
  return (
    <>
      {children}
      <FloatingChatWidget />
    </>
  );
} 
