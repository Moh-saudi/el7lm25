'use client';

import { useState } from 'react';
import { Phone, Send, CheckCircle, AlertTriangle, Loader2, Settings } from 'lucide-react';

export default function TestOTPDiagnosisPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>({});
  const [envCheck, setEnvCheck] = useState<any>(null);

  const checkEnvironment = async () => {
    try {
      const response = await fetch('/api/test-env');
      const result = await response.json();
      setEnvCheck(result.data);
    } catch (error) {
      console.error('Environment check failed:', error);
    }
  };

  const testSMSService = async () => {
    setLoading(true);
    setResults({});

    try {
      // Test 1: Check environment variables
      const envResponse = await fetch('/api/test-env');
      const envResult = await envResponse.json();
      
      // Test 2: Try sending OTP via SMS
      const smsResponse = await fetch('/api/sms/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          name,
          useTemplate: false
        })
      });
      const smsResult = await smsResponse.json();

      // Test 3: Try BeOn SMS API directly
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">تشخيص مشكلة OTP</h1>
          </div>
          <p className="text-gray-600">
            اختبار شامل لنظام إرسال رمز التحقق وتشخيص المشاكل
          </p>
        </div>

        {/* Environment Check */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">فحص متغيرات البيئة</h2>
          <button
            onClick={checkEnvironment}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            فحص متغيرات البيئة
          </button>
          
          {envCheck && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">نتائج فحص البيئة:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(envCheck, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Test Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">اختبار إرسال OTP</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل اسمك"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+201234567890"
              />
            </div>

            <button
              onClick={testSMSService}
              disabled={loading || !phoneNumber.trim() || !name.trim()}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الاختبار...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  تشغيل الاختبار الشامل
                </>
              )}
            </button>
          </div>
        </div>

        {/* Test Results */}
        {Object.keys(results).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
                        {results.environment.BEON_SMS_TOKEN.exists ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        <span>BEON_SMS_TOKEN: {results.environment.BEON_SMS_TOKEN.value}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {results.environment.BEON_WHATSAPP_TOKEN.exists ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        <span>BEON_WHATSAPP_TOKEN: {results.environment.BEON_WHATSAPP_TOKEN.value}</span>
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