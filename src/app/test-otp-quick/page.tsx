'use client';

import { useState } from 'react';
import { Phone, Send, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

export default function TestOTPQuickPage() {
  const [phoneNumber, setPhoneNumber] = useState('+201234567890');
  const [name, setName] = useState('Test User');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testOTP = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/sms/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, name })
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold">اختبار OTP سريع</h1>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">الاسم</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <button
              onClick={testOTP}
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الاختبار...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  اختبار إرسال OTP
                </>
              )}
            </button>
          </div>

          {result && (
            <div className="mt-4 p-4 rounded-lg">
              {result.success ? (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <div>
                    <p className="font-medium">نجح الاختبار!</p>
                    <p className="text-sm">{result.message}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-700 bg-red-50 p-3 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                  <div>
                    <p className="font-medium">فشل الاختبار</p>
                    <p className="text-sm">{result.error}</p>
                  </div>
                </div>
              )}
              
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-600">تفاصيل الاستجابة</summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 