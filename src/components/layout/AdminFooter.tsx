'use client';

import React from 'react';
import { Heart } from 'lucide-react';

export default function AdminFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            جميع الحقوق محفوظة © {new Date().getFullYear()}
          </div>
          
          <div className="flex items-center gap-1 text-sm text-gray-600">
            تم التطوير بكل <Heart className="w-4 h-4 text-red-500 mx-1" /> بواسطة فريق العمل
          </div>

          <div className="flex items-center gap-4 text-sm">
            <a href="/privacy" className="text-gray-600 hover:text-gray-900">
              سياسة الخصوصية
            </a>
            <a href="/terms" className="text-gray-600 hover:text-gray-900">
              الشروط والأحكام
            </a>
            <a href="/contact" className="text-gray-600 hover:text-gray-900">
              اتصل بنا
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
} 