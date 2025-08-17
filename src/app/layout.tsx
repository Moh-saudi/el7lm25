import './globals.css';
import type { Metadata } from 'next';
import { Cairo, Inter } from 'next/font/google';
import ClientLayout from './client-layout';
import { TranslationProvider } from '@/lib/translations/simple-context';
import FontManager from '@/components/ui/FontManager';

// Cairo font for Arabic text
const cairo = Cairo({ 
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap'
});

// Inter font for English text
const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'El7hm - Football Platform',
  description: 'Comprehensive platform for football management and sports',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* Viewport Meta Tag - Essential for Responsive Design */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="El7hm" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="El7hm" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#6d28d9" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* Preconnect for fonts and external services */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <link rel="dns-prefetch" href="https://api.merchant.geidea.net" />
        
        {/* Payment Meta Tags */}
        <meta name="referrer" content="no-referrer-when-downgrade" />
        
        {/* Scripts */}
        <script src="/js/performance-fix.js" defer></script>
      </head>
      <body className={`${cairo.variable} ${inter.variable} font-cairo`}>
        <FontManager>
          <TranslationProvider>
            <ClientLayout>{children}</ClientLayout>
          </TranslationProvider>
        </FontManager>
      </body>
    </html>
  );
} 