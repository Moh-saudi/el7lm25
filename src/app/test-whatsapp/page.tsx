'use client';

import { useState } from 'react';

export default function TestWhatsAppPage() {
  const [phoneNumber, setPhoneNumber] = useState('+966501234567');
  const [name, setName] = useState('أحمد');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const testWhatsAppOTP = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('🧪 Testing WhatsApp OTP for:', phoneNumber);
      
      const response = await fetch('/api/whatsapp/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          name,
          serviceType: 'business'
        })
      });

      const data = await response.json();
      
      console.log('📱 WhatsApp API Response:', data);
      
      if (response.ok && data.success) {
        setResult({
          success: true,
          message: data.message,
          phoneNumber: data.phoneNumber,
          otp: data.otp,
          otpLength: data.otpLength
        });
      } else {
        setError(data.error || 'فشل في إرسال OTP');
        setResult({
          success: false,
          error: data.error
        });
      }
    } catch (error: any) {
      console.error('❌ WhatsApp test error:', error);
      setError(`خطأ في الاختبار: ${error.message}`);
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testWhatsAppConfig = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('🔧 Testing WhatsApp configuration...');
      
      const response = await fetch('/api/whatsapp/test-config', {
        method: 'GET'
      });

      const data = await response.json();
      
      console.log('⚙️ WhatsApp Config Response:', data);
      setResult(data);
    } catch (error: any) {
      console.error('❌ Config test error:', error);
      setError(`خطأ في اختبار التكوين: ${error.message}`);
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            اختبار WhatsApp OTP
          </h1>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+966501234567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أحمد"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={testWhatsAppOTP}
              disabled={loading}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'جاري الاختبار...' : 'اختبار إرسال WhatsApp OTP'}
            </button>

            <button
              onClick={testWhatsAppConfig}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'جاري الاختبار...' : 'اختبار تكوين WhatsApp'}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">نتيجة الاختبار:</h3>
              
              <div className={`p-4 rounded-lg border ${
                result.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>

              {result.success && result.otp && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">رمز التحقق المرسل:</h4>
                  <p className="text-2xl font-mono text-yellow-900">{result.otp}</p>
                  <p className="text-sm text-yellow-700 mt-2">
                    (هذا للاختبار فقط - في الإنتاج لن يظهر الرمز)
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">معلومات مهمة:</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• تأكد من أن متغيرات البيئة لـ WhatsApp مضبوطة بشكل صحيح</li>
              <li>• WHATSAPP_ACCESS_TOKEN و WHATSAPP_PHONE_ID مطلوبان</li>
              <li>• رقم الهاتف يجب أن يكون بالتنسيق الدولي (+966501234567)</li>
              <li>• في الإنتاج، لن يظهر رمز التحقق في الاستجابة</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 