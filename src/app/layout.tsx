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
        {/* Geidea Security Meta Tags */}
        <meta httpEquiv="Content-Security-Policy" content="frame-ancestors 'self' https://www.merchant.geidea.net https://checkout.geidea.net https://gateway.mastercard.com;" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        
        {/* Geidea Payment Scripts - Load Early */}
        <Script
          id="geidea-checkout"
          src="https://www.merchant.geidea.net/hpp/geideaCheckout.min.js"
          strategy="beforeInteractive"
          crossOrigin="anonymous"
        />
        
        {/* Additional Geidea Security Script */}
        <Script id="geidea-security" strategy="beforeInteractive">
          {`
            // Configure Geidea security settings
            window.geideaConfig = {
              allowFraming: true,
              crossOrigin: true,
              secure: true
            };
            
            // Handle frame security
            if (window.self !== window.top) {
              console.log('Running in frame - Geidea payment context');
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