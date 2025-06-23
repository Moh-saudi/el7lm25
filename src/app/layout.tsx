import './globals.css';
import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import { Suspense } from 'react';
import Script from 'next/script';
import { AuthProvider } from '@/lib/firebase/auth-provider';
import { Providers } from './providers';
import OfflineIndicator from '@/components/ui/offline-indicator';

// خط Cairo للجميع - عربي وإنجليزي
const cairo = Cairo({ 
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap'
});

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
      <body className={`${cairo.variable} font-cairo`}>
        <AuthProvider>
          <Providers>
            <OfflineIndicator />
            <Suspense fallback={<div>جاري التحميل...</div>}>
              {children}
            </Suspense>
          </Providers>
        </AuthProvider>
        
        {/* Core Scripts Only - Critical Path */}
        <Script src="/js/production-security.js" strategy="beforeInteractive" />
        <Script src="/js/performance-fix.js" strategy="beforeInteractive" />
        <Script src="/js/script-error-handler.js" strategy="afterInteractive" />
        <Script src="/js/smart-script-loader.js" strategy="afterInteractive" />
        
        {/* Essential Fixes - Handled by Smart Script Loader */}
        
        {/* Page-Specific Scripts - Load Only When Needed */}
        <Script id="conditional-scripts" strategy="lazyOnload">
          {`
            // تحميل مشروط للسكريبتات حسب الصفحة
            const loadPageScripts = () => {
              const path = window.location.pathname;
              const scripts = [];
              
              // إزالة السكريبتات المعقدة - نستخدم الآن الطريقة البسيطة
              
              // سكريبتات الصور فقط عند الحاجة
              if (document.querySelectorAll('img').length > 5) {
                scripts.push('/js/global-image-monitor.js');
              }
              
              // تحميل السكريبتات واحداً تلو الآخر
              scripts.forEach((src, index) => {
                setTimeout(() => {
                  const script = document.createElement('script');
                  script.src = src;
                  script.async = true;
                  document.head.appendChild(script);
                }, index * 500); // تأخير تدريجي
              });
            };
            
            // تحميل بعد اكتمال الصفحة
            if (document.readyState === 'complete') {
              setTimeout(loadPageScripts, 2000);
            } else {
              window.addEventListener('load', () => {
                setTimeout(loadPageScripts, 2000);
              });
            }
          `}
        </Script>
        
        {/* Development Scripts - Minimal and Conditional */}
        {process.env.NODE_ENV === 'development' && (
          <Script id="dev-scripts" strategy="lazyOnload">
            {`
              // تحميل سكريبتات التطوير عند الحاجة فقط
              const loadDevScripts = () => {
                const devScripts = [
                  '/js/firebase-debug.js',
                  '/js/auth-debug.js'
                ];
                
                // تحميل فقط عند وجود مشاكل
                if (localStorage.getItem('debug-mode') === 'true' || 
                    window.location.search.includes('debug=true')) {
                  devScripts.forEach((src, index) => {
                    setTimeout(() => {
                      const script = document.createElement('script');
                      script.src = src;
                      script.async = true;
                      document.head.appendChild(script);
                    }, index * 1000);
                  });
                }
              };
              
              // تفعيل وضع التطوير بالضغط على Ctrl+Shift+D
              document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                  localStorage.setItem('debug-mode', 'true');
                  loadDevScripts();
                  console.log('🔧 Debug mode activated');
                }
              });
            `}
          </Script>
        )}
      </body>
    </html>
  );
}