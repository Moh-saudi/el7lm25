import './globals.css';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import { AuthProvider } from '@/lib/firebase/auth-provider';

// تحميل فلتر الكونسول في بيئة التطوير
if (typeof window !== 'undefined') {
  import('@/utils/console-filter');
}

export const metadata: Metadata = {
  title: 'HagzZGo - منصة اكتشاف المواهب الرياضية',
  description: 'منصة متكاملة تربط بين اللاعبين والأندية والمدربين',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <Script
          src="https://www.merchant.geidea.net/hpp/geideaCheckout.min.js"
          strategy="beforeInteractive"
        />
        <Script
          id="apple-pay-detection"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Apple Pay Support Detection
              if (typeof window !== 'undefined') {
                window.addEventListener('load', function() {
                  if (window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
                    document.documentElement.classList.add('apple-pay-supported');
                    console.log('🍎 Apple Pay is supported on this device');
                  } else {
                    console.log('🍎 Apple Pay is not supported on this device');
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <Suspense fallback={<div>جاري التحميل...</div>}>
            {children}
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}