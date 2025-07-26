'use client';

import React from 'react';
import { useTranslation } from '@/lib/translations/simple-context';

interface DashboardFontWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function DashboardFontWrapper({ children, className = '' }: DashboardFontWrapperProps) {
  const { language, direction } = useTranslation();
  
  // تحديد الخط حسب اللغة
  const fontClass = language === 'en' ? 'font-english' : 'font-arabic';
  
  return (
    <div className={`min-h-screen ${fontClass} ${className}`} style={{ direction }} lang={language}>
      {children}
    </div>
  );
}

// مكون خاص للعناوين في لوحات التحكم
export function DashboardHeading({ 
  children, 
  level = 'h1', 
  className = '' 
}: { 
  children: React.ReactNode; 
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'; 
  className?: string;
}) {
  const { language } = useTranslation();
  const fontClass = language === 'en' ? 'font-english' : 'font-arabic';
  
  const Tag = level as keyof JSX.IntrinsicElements;
  
  return (
    <Tag className={`${fontClass} ${className}`} lang={language}>
      {children}
    </Tag>
  );
}

// مكون خاص للنصوص في لوحات التحكم
export function DashboardText({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  const { language } = useTranslation();
  const fontClass = language === 'en' ? 'font-english' : 'font-arabic';
  
  return (
    <span className={`${fontClass} ${className}`} lang={language}>
      {children}
    </span>
  );
}

// مكون خاص للأزرار في لوحات التحكم
export function DashboardButton({ 
  children, 
  className = '', 
  ...props 
}: { 
  children: React.ReactNode; 
  className?: string;
  [key: string]: any;
}) {
  const { language } = useTranslation();
  const fontClass = language === 'en' ? 'font-english' : 'font-arabic';
  
  return (
    <button className={`${fontClass} ${className}`} lang={language} {...props}>
      {children}
    </button>
  );
}

// مكون خاص لحقول الإدخال في لوحات التحكم
export function DashboardInput({ 
  className = '', 
  ...props 
}: { 
  className?: string;
  [key: string]: any;
}) {
  const { language } = useTranslation();
  const fontClass = language === 'en' ? 'font-english' : 'font-arabic';
  
  return (
    <input className={`${fontClass} ${className}`} lang={language} {...props} />
  );
}

// مكون خاص للنصوص المختلطة في لوحات التحكم
export function DashboardMixedText({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <span className={`font-auto ${className}`}>
      {children}
    </span>
  );
} 