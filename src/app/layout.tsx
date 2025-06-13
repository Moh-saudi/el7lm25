import './globals.css';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthProvider } from '@/lib/firebase/auth-provider';

export const metadata: Metadata = {
  title: 'HagzZGo - منصة اكتشاف المواهب الرياضية',
  description: 'منصة متكاملة تربط بين اللاعبين والأندية والمدربين',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
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