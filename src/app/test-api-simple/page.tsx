'use client';

import { useState } from 'react';
import { Phone, Send, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

export default function TestAPISimplePage() {
  const [phoneNumber, setPhoneNumber] = useState('+201234567890');
  const [name, setName] = useState('Test User');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>({});

  const testAllAPIs = async () => {
    setLoading(true);
    setResults({});

    try {
      // Test 1: Environment variables
      const envResponse = await fetch('/api/test-env');
      const envResult = await envResponse.json();

      // Test 2: SMS OTP API
      const smsResponse = await fetch('/api/sms/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, name })
      });
      const smsResult = await smsResponse.json();

      // Test 3: BeOn SMS API
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

      setResults({
        environment: envResult.data,
        smsAPI: smsResult,
        beonAPI: beonResult
      });

    } catch (error: any) {
      console.error('Test failed:', error);
      setResults({
        error: error.message
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold">اختبار APIs</h1>
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
              onClick={testAllAPIs}
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
                  اختبار جميع APIs
                </>
              )}
            </button>
          </div>
        </div>

        {Object.keys(results).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">نتائج الاختبار</h2>
            
            {results.error ? (
              <div className="flex items-center gap-2 p-3 text-red-700 bg-red-50 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
                <p className="text-sm">خطأ في الاختبار: {results.error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Environment Check */}
                {results.environment && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">فحص البيئة:</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {results.environment.BEON_SMS_TOKEN?.exists ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        <span>BEON_SMS_TOKEN: {results.environment.BEON_SMS_TOKEN?.value || 'NOT_SET'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {results.environment.BEON_WHATSAPP_TOKEN?.exists ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        <span>BEON_WHATSAPP_TOKEN: {results.environment.BEON_WHATSAPP_TOKEN?.value || 'NOT_SET'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SMS API Test */}
                {results.smsAPI && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">اختبار SMS API:</h3>
                    <div className="flex items-center gap-2">
                      {results.smsAPI.success ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                      <span>
                        {results.smsAPI.success ? 'نجح' : 'فشل'}: {results.smsAPI.message || results.smsAPI.error}
                      </span>
                    </div>
                  </div>
                )}

                {/* BeOn API Test */}
                {results.beonAPI && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">اختبار BeOn API:</h3>
                    <div className="flex items-center gap-2">
                      {results.beonAPI.success ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                      <span>
                        {results.beonAPI.success ? 'نجح' : 'فشل'}: {results.beonAPI.message || results.beonAPI.error}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 