'use client';

import React from 'react';
import { useTranslation } from '@/lib/translations/simple-context';

interface FontProviderProps {
  children: React.ReactNode;
  className?: string;
}

export default function FontProvider({ children, className = '' }: FontProviderProps) {
  const { language } = useTranslation();
  
  // تحديد الخط حسب اللغة
  const fontClass = language === 'en' ? 'font-english' : 'font-arabic';
  
  return (
    <div className={`${fontClass} ${className}`} lang={language}>
      {children}
    </div>
  );
}

// مكون للعناوين مع الخط المناسب
export function FontHeading({ 
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

// مكون للنصوص مع الخط المناسب
export function FontText({ 
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

// مكون للأزرار مع الخط المناسب
export function FontButton({ 
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

// مكون لحقول الإدخال مع الخط المناسب
export function FontInput({ 
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

// مكون للنصوص المختلطة (عربي + إنجليزي)
export function MixedFontText({ 
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