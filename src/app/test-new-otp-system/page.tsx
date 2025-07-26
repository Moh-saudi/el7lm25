'use client';

import { useState } from 'react';

export default function TestNewOTPSystem() {
  const [phone, setPhone] = useState('97472053188');
  const [otp, setOtp] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const sendWhatsAppOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications/smart-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          name: 'اختبار النظام الجديد',
          country: 'قطر',
          countryCode: '+974'
        })
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Error: ' + error);
    }
    setLoading(false);
  };

  const sendSMSOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sms/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phone,
          name: 'اختبار النظام الجديد'
        })
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Error: ' + error);
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sms/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phone,
          otpCode: otp
        })
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Error: ' + error);
    }
    setLoading(false);
  };

  const testStorage = async (action: string, source?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/sms/test-new-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          phone,
          otp: otp || '123456',
          source
        })
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Error: ' + error);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">اختبار النظام الجديد للـ OTP</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* اختبار الإرسال */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">اختبار الإرسال</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">رقم الهاتف:</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="97472053188"
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={sendWhatsAppOTP}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              إرسال WhatsApp OTP
            </button>
            
            <button
              onClick={sendSMSOTP}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              إرسال SMS OTP
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">رمز التحقق:</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="123456"
            />
          </div>

          <button
            onClick={verifyOTP}
            disabled={loading || !otp}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            التحقق من OTP
          </button>
        </div>

        {/* اختبار التخزين المباشر */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">اختبار التخزين المباشر</h2>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => testStorage('store', 'whatsapp')}
              disabled={loading}
              className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
            >
              تخزين WhatsApp
            </button>
            
            <button
              onClick={() => testStorage('store', 'sms')}
              disabled={loading}
              className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              تخزين SMS
            </button>
            
            <button
              onClick={() => testStorage('get')}
              disabled={loading}
              className="px-3 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
            >
              جلب OTP
            </button>
            
            <button
              onClick={() => testStorage('getBySource', 'whatsapp')}
              disabled={loading}
              className="px-3 py-2 bg-green-700 text-white rounded text-sm hover:bg-green-800 disabled:opacity-50"
            >
              جلب WhatsApp
            </button>
            
            <button
              onClick={() => testStorage('getBySource', 'sms')}
              disabled={loading}
              className="px-3 py-2 bg-blue-700 text-white rounded text-sm hover:bg-blue-800 disabled:opacity-50"
            >
              جلب SMS
            </button>
            
            <button
              onClick={() => testStorage('status')}
              disabled={loading}
              className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 disabled:opacity-50"
            >
              حالة التخزين
            </button>
            
            <button
              onClick={() => testStorage('clear', 'whatsapp')}
              disabled={loading}
              className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
            >
              مسح WhatsApp
            </button>
            
            <button
              onClick={() => testStorage('clear', 'sms')}
              disabled={loading}
              className="px-3 py-2 bg-red-700 text-white rounded text-sm hover:bg-red-800 disabled:opacity-50"
            >
              مسح SMS
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="mt-8">
          <h3 className="font-medium mb-2">النتيجة:</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
} 