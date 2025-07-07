'use client';

import React from 'react';

interface AcademyLayoutProps {
  children: React.ReactNode;
}

export default function AcademyLayout({ children }: AcademyLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
} 
