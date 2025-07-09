'use client';

import { useState } from 'react';
import beonSMSService from '@/lib/beon/sms-service';

export default function TestBeOnNewAPI() {
  const [phoneNumber, setPhoneNumber] = useState('+201122652572');
  const [name, setName] = useState('gouda');
  const [otpLength, setOtpLength] = useState(4);
  const [lang, setLang] = useState('ar');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSendOTP = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // تنسيق رقم الهاتف
      const formattedPhone = beonSMSService.formatPhoneNumber(phoneNumber);
      
      if (!beonSMSService.validatePhoneNumber(formattedPhone)) {
        setError('رقم الهاتف غير صحيح');
        return;
      }

      console.log('📱 Sending OTP to:', formattedPhone);
      console.log('👤 Name:', name);
      console.log('🔢 OTP Length:', otpLength);
      console.log('🌐 Language:', lang);

      const response = await beonSMSService.sendOTPNew(formattedPhone, name, otpLength, lang);
      
      setResult(response);
      
      if (response.success) {
        console.log('✅ OTP sent successfully!');
        console.log('📋 OTP Code:', response.otp);
        console.log('💬 Message:', response.message);
      } else {
        console.error('❌ OTP sending failed:', response.error);
        setError(response.error || 'فشل في إرسال OTP');
      }
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const handleTestValidation = () => {
    const formattedPhone = beonSMSService.formatPhoneNumber(phoneNumber);
    const isValid = beonSMSService.validatePhoneNumber(formattedPhone);
    
    setResult({
      success: true,
      data: {
        original: phoneNumber,
        formatted: formattedPhone,
        isValid: isValid
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            اختبار API الجديد لـ BeOn
          </h1>
          
          <div className="space-y-4">
            {/* رقم الهاتف */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف (مع رمز الدولة)
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+201122652572"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* الاسم */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="gouda"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* طول OTP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                طول رمز التحقق
              </label>
              <select
                value={otpLength}
                onChange={(e) => setOtpLength(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={4}>4 أرقام</option>
                <option value={6}>6 أرقام</option>
              </select>
            </div>

            {/* اللغة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اللغة
              </label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* الأزرار */}
            <div className="flex space-x-4 pt-4">
              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري الإرسال...' : 'إرسال OTP'}
              </button>
              
              <button
                onClick={handleTestValidation}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
              >
                اختبار التنسيق
              </button>
            </div>
          </div>

          {/* النتائج */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-sm font-medium text-red-800 mb-2">خطأ:</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="text-sm font-medium text-green-800 mb-2">النتيجة:</h3>
              <pre className="text-sm text-green-700 whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {/* معلومات API */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 mb-2">معلومات API:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Base URL:</strong> https://beon.chat/api/send/message/otp</p>
              <p><strong>Method:</strong> POST</p>
              <p><strong>Content-Type:</strong> multipart/form-data</p>
              <p><strong>Token:</strong> vSCuMzZwLjDxzR882YphwEgW</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 