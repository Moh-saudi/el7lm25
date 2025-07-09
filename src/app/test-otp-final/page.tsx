'use client';

import { useState } from 'react';
import { Phone, Send, CheckCircle, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';

export default function TestOTPFinalPage() {
  const [phoneNumber, setPhoneNumber] = useState('+201234567890');
  const [name, setName] = useState('Test User');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [testType, setTestType] = useState<'sms' | 'beon' | 'both'>('both');

  const testOTP = async () => {
    setLoading(true);
    setResult(null);

    try {
      let testResults: any = {};

      if (testType === 'sms' || testType === 'both') {
        console.log('🧪 Testing SMS OTP API...');
        const smsResponse = await fetch('/api/sms/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber, name })
        });
        const smsResult = await smsResponse.json();
        testResults.sms = smsResult;
        console.log('📱 SMS API result:', smsResult);
      }

      if (testType === 'beon' || testType === 'both') {
        console.log('🧪 Testing BeOn SMS API...');
        const beonResponse = await fetch('/api/notifications/sms/beon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber,
            name,
            otp_length: 6,
            lang: 'ar'
          })
        });
        const beonResult = await beonResponse.json();
        testResults.beon = beonResult;
        console.log('📱 BeOn API result:', beonResult);
      }

      setResult(testResults);
    } catch (error: any) {
      console.error('❌ Test failed:', error);
      setResult({ error: error.message });
    }

    setLoading(false);
  };

  const resetTest = () => {
    setResult(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold">اختبار OTP النهائي</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">الاسم</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="أدخل اسمك"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="+201234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">نوع الاختبار</label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as 'sms' | 'beon' | 'both')}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="both">اختبار كلا API</option>
                <option value="sms">SMS API فقط</option>
                <option value="beon">BeOn API فقط</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={testOTP}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
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

              <button
                onClick={resetTest}
                disabled={loading}
                className="px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">نتائج الاختبار</h2>
            
            {result.error ? (
              <div className="flex items-center gap-2 p-3 text-red-700 bg-red-50 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
                <p className="text-sm">خطأ في الاختبار: {result.error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {result.sms && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">SMS API:</h3>
                    <div className="flex items-center gap-2">
                      {result.sms.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      )}
                      <span>
                        {result.sms.success ? 'نجح' : 'فشل'}: {result.sms.message || result.sms.error}
                      </span>
                    </div>
                  </div>
                )}

                {result.beon && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">BeOn API:</h3>
                    <div className="flex items-center gap-2">
                      {result.beon.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      )}
                      <span>
                        {result.beon.success ? 'نجح' : 'فشل'}: {result.beon.message || result.beon.error}
                      </span>
                    </div>
                  </div>
                )}

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-600 font-medium">
                    تفاصيل الاستجابة
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 