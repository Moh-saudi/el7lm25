'use client';

import React from 'react';

interface DreamAcademyLayoutProps {
  children: React.ReactNode;
}

export default function DreamAcademyLayout({ children }: DreamAcademyLayoutProps) {
  // استخدام layout اللاعب مباشرة بدون تكرار
  return <>{children}</>;
} 