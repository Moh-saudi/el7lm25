'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function ContactPage() {
  const router = useRouter();
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      router.push('/');
    }
  };
  return (
    <div className="max-w-2xl mx-auto py-12 text-center">
      <button
        onClick={handleBack}
        className="mb-6 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-gray-700 font-medium"
      >
        العودة
      </button>
      <h1 className="text-3xl font-bold mb-4">اتصل بنا</h1>
      <p className="text-gray-700 text-lg mb-2">للتواصل مع فريق الحلم (el7lm) تحت مِيسك القابضة أو للاستفسارات:</p>
      <p className="text-gray-700">البريد الإلكتروني: <a href="mailto:info@el7lm.com" className="text-blue-600 underline">info@el7lm.com</a></p>
      <p className="text-gray-700 mt-2">قطر: <a href="tel:+97472053188" className="text-blue-600 underline">97472053188</a></p>
      <p className="text-gray-700">مصر: <a href="tel:+201017799580" className="text-blue-600 underline">01017799580</a></p>
    </div>
  );
} 
