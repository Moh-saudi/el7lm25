'use client';

import { useState } from 'react';
import { Settings, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

export default function TestEnvSimplePage() {
  const [loading, setLoading] = useState(false);
  const [envData, setEnvData] = useState<any>(null);

  const checkEnvironment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-env');
      const result = await response.json();
      setEnvData(result.data);
    } catch (error: any) {
      console.error('Environment check failed:', error);
      setEnvData({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold">فحص متغيرات البيئة</h1>
          </div>
          
          <button
            onClick={checkEnvironment}
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري الفحص...
              </>
            ) : (
              <>
                <Settings className="w-4 h-4" />
                فحص متغيرات البيئة
              </>
            )}
          </button>

          {envData && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">نتائج الفحص</h2>
              
              {envData.error ? (
                <div className="flex items-center gap-2 p-3 text-red-700 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                  <p className="text-sm">خطأ: {envData.error}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(envData).map(([key, value]: [string, any]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {value.exists ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        )}
                        <span className="font-medium">{key}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <div>الحالة: {value.exists ? 'موجود' : 'غير موجود'}</div>
                        <div>الطول: {value.length || 'غير محدد'}</div>
                        <div>القيمة: {value.value || 'غير محدد'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 