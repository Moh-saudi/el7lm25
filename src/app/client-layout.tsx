'use client';

import { Suspense } from 'react';
import Script from 'next/script';
import { AuthProvider } from '@/lib/firebase/auth-provider';
import { Providers } from './providers';
import OfflineIndicator from '@/components/ui/offline-indicator';
import AppErrorBoundary from '@/components/security/AppErrorBoundary';
import FloatingChatWidget from '@/components/support/FloatingChatWidget';
import { Toaster } from 'react-hot-toast';
import '@/lib/utils/console-manager'; // تفعيل نظام إلغاء رسائل الكونسول
import '@/lib/utils/dev-console'; // أدوات المطورين للكونسول
import React from 'react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Add system logging - avoid hydration mismatch by using stable values
  React.useEffect(() => {
    // Only log on client side after hydration
    if (typeof window !== 'undefined') {
      console.log('🚀 Application Started:', {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        environment: process.env.NODE_ENV
      });
    }
  }, []);

  return (
    <>
      {/* Console Silencer - Load First */}
      <Script id="console-silencer" strategy="beforeInteractive">
        {`
          // إلغاء فوري لجميع رسائل الكونسول
          if (typeof window !== 'undefined') {
            // حفظ console.error الأصلي للأخطاء المهمة
            const originalError = console.error;
            
            // إلغاء جميع رسائل الكونسول
            console.log = function() {};
            console.warn = function() {};
            console.info = function() {};
            console.debug = function() {};
            console.group = function() {};
            console.groupEnd = function() {};
            console.groupCollapsed = function() {};
            console.trace = function() {};
            console.table = function() {};
            console.time = function() {};
            console.timeEnd = function() {};
            console.count = function() {};
            console.countReset = function() {};
            console.clear = function() {};
            console.assert = function() {};
            console.dir = function() {};
            console.dirxml = function() {};
            
            // السماح بالأخطاء الحرجة فقط
            console.error = function(...args) {
              const message = args.join(' ').toLowerCase();
              if (message.includes('critical') || message.includes('fatal') || message.includes('uncaught')) {
                originalError.apply(console, args);
              }
            };
            
            // إلغاء رسائل الأخطاء المزعجة
            window.addEventListener('error', function(e) {
              e.stopPropagation();
              e.preventDefault();
              return false;
            }, true);
            
            window.addEventListener('unhandledrejection', function(e) {
              e.stopPropagation();
              e.preventDefault();
              return false;
            }, true);
          }
        `}
      </Script>

      {/* Process Polyfill - Load Before Interactive */}
      <Script id="process-polyfill" strategy="beforeInteractive">
        {`
          // Create process polyfill before webpack modules load
          if (typeof window !== 'undefined' && !window.process) {
            window.process = {
              env: { NODE_ENV: 'development' },
              browser: true,
              version: '',
              versions: { node: '18.0.0' },
              platform: 'browser',
              nextTick: function(fn) { setTimeout(fn, 0); },
              cwd: function() { return '/'; },
              chdir: function() {},
              umask: function() { return 0; }
            };
          }
        `}
      </Script>
      
      {/* Apple Pay Detection Script */}
      <Script id="apple-pay-detection" strategy="afterInteractive">
        {`
          if (typeof window !== 'undefined') {
            window.addEventListener('load', function() {
              if (window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
                document.documentElement.classList.add('apple-pay-supported');
              }
            });
          }
        `}
      </Script>
      
      {/* Geidea Configuration Script */}
      <Script id="geidea-config" strategy="afterInteractive">
        {`
          // Configure Geidea settings
          if (typeof window !== 'undefined') {
            window.geideaConfig = {
              allowUnsafeHeaders: true,
              allowAllFrames: true,
              bypassCSP: true,
              allowCrossOrigin: true
            };
            
            const originalXHR = window.XMLHttpRequest;
            window.XMLHttpRequest = function() {
              const xhr = new originalXHR();
              const originalSetRequestHeader = xhr.setRequestHeader;
              xhr.setRequestHeader = function(name, value) {
                try {
                  return originalSetRequestHeader.call(this, name, value);
                } catch (e) {
                  // تجاهل بصمت
                }
              };
              return xhr;
            };
          }
        `}
      </Script>
      
      {/* Service Worker Registration */}
      <Script id="sw-registration" strategy="afterInteractive">
        {`
          if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.process?.env?.NODE_ENV === 'production') {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                  // Update Service Worker
                  registration.addEventListener('updatefound', function() {
                    const newWorker = registration.installing;
                    if (newWorker) {
                      newWorker.addEventListener('statechange', function() {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                          // New Service Worker available
                          if (confirm('تحديث جديد متاح. هل تريد إعادة تحميل الصفحة؟')) {
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                            window.location.reload();
                          }
                        }
                      });
                    }
                  });
                  
                  // Send important URLs for caching
                  registration.active && registration.active.postMessage({
                    type: 'CACHE_URLS',
                    payload: {
                      urls: ['/dashboard', '/auth/login', '/dashboard/players']
                    }
                  });
                })
                .catch(function(error) {
                  // تجاهل بصمت
                });
            });
          }
        `}
      </Script>

      {/* Silent Environment Check - Development Only */}
      <Script id="environment-check" strategy="afterInteractive">
        {`
          // تحقق صامت من البيئة دون إظهار رسائل
          if (typeof window !== 'undefined') {
            window.addEventListener('load', () => {
              // إعداد متغير البيئة بصمت
              window.envCheck = {
                isDev: '${process.env.NODE_ENV}' === 'development',
                timestamp: new Date().getTime()
              };
            });
          }
        `}
      </Script>

      <AppErrorBoundary>
        <AuthProvider>
          <Providers>
            <OfflineIndicator />
            <Suspense fallback={<div>Loading...</div>}>
              {children}
            </Suspense>
            <FloatingChatWidget />
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </Providers>
        </AuthProvider>
      </AppErrorBoundary>
    </>
  );
} 