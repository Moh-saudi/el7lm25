import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AcademyFooter() {
  const year = new Date().getFullYear();
  const [lang, setLang] = useState('ar');

  useEffect(() => {
    const htmlLang = document.documentElement.lang;
    setLang(htmlLang || 'ar');
  }, []);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 px-4 flex items-center justify-between mt-auto" style={{ direction: dir }}>
      <div className="font-bold text-gray-500 dark:text-gray-300">© {year} منصة حجز جو - أكاديميتك نحو التميز الرياضي</div>
      <div className="flex gap-6 text-sm">
        <Link href="/about" className="text-gray-500 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-300">عن المنصة</Link>
        <Link href="/contact" className="text-gray-500 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-300">اتصل بنا</Link>
        <Link href="/privacy" className="text-gray-500 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-300">سياسة الخصوصية</Link>
      </div>
    </footer>
  );
} 
