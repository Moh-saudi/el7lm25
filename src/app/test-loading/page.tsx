'use client';

import { useState } from 'react';
import LoadingScreen from '@/components/shared/LoadingScreen';
import ErrorScreen from '@/components/shared/ErrorScreen';
import SimpleLoader from '@/components/shared/SimpleLoader';

export default function TestLoadingPage() {
  const [currentDemo, setCurrentDemo] = useState<'default' | 'pulse' | 'dots' | 'wave' | 'gradient' | 'simple' | 'error'>('simple');

  if (currentDemo === 'error') {
    return (
      <div>
        <ErrorScreen 
          title="مثال على شاشة الخطأ"
          message="هذا مثال على شاشة الخطأ العصرية الجديدة"
          type="error"
        />
        <button 
          onClick={() => setCurrentDemo('simple')}
          className="fixed top-4 left-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors z-50"
        >
          العودة للتحميل
        </button>
      </div>
    );
  }

  if (currentDemo === 'simple') {
    return (
      <div>
        <SimpleLoader 
          size="medium"
          color="blue"
        />
        <div className="fixed top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg z-50">
          <h3 className="text-sm font-semibold mb-3 text-gray-800">الكرات المدارية البسيطة</h3>
          <button 
            onClick={() => setCurrentDemo('gradient')}
            className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            رؤية الأنواع الأخرى
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <LoadingScreen 
        message="جاري تحميل بيانات المستخدم..."
        subMessage="الرجاء الانتظار لحظات"
        type={currentDemo}
      />
      
      {/* شريط التحكم */}
      <div className="fixed top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg z-50">
        <h3 className="text-sm font-semibold mb-3 text-gray-800">اختر نوع التحميل:</h3>
        <div className="space-y-2">
          <button 
            onClick={() => setCurrentDemo('simple')}
            className="block w-full text-left px-3 py-2 rounded-md text-sm transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            ⚪ كرات بسيطة (مطبق)
          </button>
          
          <button 
            onClick={() => setCurrentDemo('gradient')}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              currentDemo === 'gradient' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🌈 Gradient
          </button>
          
          <button 
            onClick={() => setCurrentDemo('pulse')}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              currentDemo === 'pulse' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💫 Pulse
          </button>
          
          <button 
            onClick={() => setCurrentDemo('dots')}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              currentDemo === 'dots' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🔵 Dots
          </button>
          
          <button 
            onClick={() => setCurrentDemo('wave')}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              currentDemo === 'wave' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🌊 Wave
          </button>
          
          <button 
            onClick={() => setCurrentDemo('default')}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              currentDemo === 'default' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⚪ Default
          </button>
          
          <hr className="my-2" />
          
          <button 
            onClick={() => setCurrentDemo('error')}
            className="block w-full text-left px-3 py-2 rounded-md text-sm transition-colors bg-red-100 text-red-700 hover:bg-red-200"
          >
            ⚠️ شاشة الخطأ
          </button>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            الكرات البسيطة مطبقة الآن في النظام
          </p>
          <p className="text-xs text-gray-400 mt-1">
            هذه الأنواع المختلفة من شاشات التحميل العصرية
          </p>
        </div>
      </div>
    </div>
  );
} 
