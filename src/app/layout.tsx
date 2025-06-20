import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import Script from 'next/script';
import { AuthProvider } from '@/lib/firebase/auth-provider';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HAGZZ GO - منصة اللاعبين الاحترافية',
  description: 'منصة متقدمة للاعبين كرة القدم للتواصل مع الأندية والوكلاء',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* Payment Meta Tags - CSP removed (handled by next.config.js) */}
        <meta name="referrer" content="no-referrer-when-downgrade" />
        
        {/* Geidea Payment Scripts */}
        <Script
          id="geidea-checkout"
          src="https://www.merchant.geidea.net/hpp/geideaCheckout.min.js"
          strategy="beforeInteractive"
        />
        
        {/* Apple Pay Detection Script */}
        <Script id="apple-pay-detection" strategy="afterInteractive">
          {`
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
          `}
        </Script>
        
        {/* Geidea Configuration Script */}
        <Script id="geidea-config" strategy="beforeInteractive">
          {`
            // تكوين Geidea لدعم جميع الـ headers والـ frames
            if (typeof window !== 'undefined') {
              window.geideaConfig = {
                allowUnsafeHeaders: true,
                allowAllFrames: true,
                bypassCSP: true,
                allowCrossOrigin: true
              };
              
              // Override XMLHttpRequest للسماح بجميع الـ headers
              const originalXHR = window.XMLHttpRequest;
              window.XMLHttpRequest = function() {
                const xhr = new originalXHR();
                const originalSetRequestHeader = xhr.setRequestHeader;
                xhr.setRequestHeader = function(name, value) {
                  try {
                    return originalSetRequestHeader.call(this, name, value);
                  } catch (e) {
                    // تجاهل أخطاء الـ headers المحظورة
                    console.log('Header ignored:', name);
                  }
                };
                return xhr;
              };
            }
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Providers>
            <Suspense fallback={<div>جاري التحميل...</div>}>
              {children}
            </Suspense>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}