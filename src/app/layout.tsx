import './globals.css';
import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import ClientLayout from './client-layout';

// Cairo font for Arabic and Latin text
const cairo = Cairo({ 
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'El7hm - منصة كرة القدم',
  description: 'منصة شاملة لإدارة كرة القدم والرياضة',
  keywords: 'football, players, clubs, agents, trainers, academies, professional',
  authors: [{ name: 'El7hm Team' }],
  creator: 'El7hm',
  publisher: 'El7hm',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // PWA Metadata
  manifest: '/manifest.json',
  // Open Graph
  openGraph: {
    title: 'El7hm - Professional Football Platform',
    description: 'Advanced platform for football players to connect with clubs and agents',
    url: 'https://el7hm.com',
    siteName: 'El7hm',
    locale: 'ar_SA',
    type: 'website',
  },
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'El7hm - Professional Football Platform',
    description: 'Advanced platform for football players to connect with clubs and agents',
    creator: '@el7hm',
  },
  // App Links
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'El7hm',
  },
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' }
    ],
    apple: '/favicon.ico',
    shortcut: '/favicon.ico'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="El7hm" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="El7hm" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#6d28d9" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/favicon.ico" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* Preconnect for fonts and external services */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="dns-prefetch" href="https://api.merchant.geidea.net" />
        
        {/* Payment Meta Tags */}
        <meta name="referrer" content="no-referrer-when-downgrade" />
        
        <script src="/js/advanced-image-fix.js" defer></script>
        <script src="/js/image-loading-optimizer.js" defer></script>
      </head>
      <body className={`${cairo.variable} font-cairo`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
} 