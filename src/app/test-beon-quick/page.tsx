'use client';

import { useState } from 'react';

export default function TestBeOnQuick() {
  const [phoneNumber, setPhoneNumber] = useState('+201122652572');
  const [name, setName] = useState('gouda');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSendOTP = async () => {
    // منع الإرسال المتكرر
    if (loading) {
      console.log('🛑 BeOn Quick OTP sending blocked - already loading');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // إنشاء FormData
      const formData = new FormData();
      formData.append('phoneNumber', phoneNumber);
      formData.append('name', name);
      formData.append('type', 'sms');
      formData.append('otp_length', '4');
      formData.append('lang', 'ar');

      console.log('📱 Sending OTP to:', phoneNumber);
      console.log('👤 Name:', name);

      const response = await fetch('/api/sms/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          name: name
        })
      });

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        console.log('✅ OTP sent successfully!');
        console.log('📋 OTP Code:', data.otp);
        console.log('💬 Message:', data.message);
      } else {
        console.error('❌ OTP sending failed:', data.error);
        setError(data.error || 'فشل في إرسال OTP');
      }
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6 text-center">
            اختبار سريع - BeOn API الجديد
          </h1>
          
          <div className="space-y-4">
            {/* رقم الهاتف */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف
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

            {/* زر الإرسال */}
            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال OTP'}
            </button>
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

          {/* معلومات سريعة */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 mb-2">معلومات سريعة:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>API:</strong> BeOn الجديد</p>
              <p><strong>Token:</strong> vSCuMzZwLjDxzR882YphwEgW</p>
              <p><strong>OTP Length:</strong> 4 أرقام</p>
              <p><strong>Language:</strong> العربية</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 