'use client';

import { useAuth } from '@/lib/firebase/auth-provider';
import { useState } from 'react';

export default function TestRegistrationPage() {
  const { register, login, user, userData, logout } = useAuth();
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('12345678');
  const [testName, setTestName] = useState('مستخدم تجريبي');
  const [testPhone, setTestPhone] = useState('1234567890');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleTestRegistration = async () => {
    try {
      setMessage('');
      setError('');
      
      const result = await register(testEmail, testPassword, 'player', {
        full_name: testName,
        phone: testPhone,
        country: 'السعودية',
        countryCode: '+966',
        currency: 'SAR',
        currencySymbol: 'ر.س'
      });
      
      setMessage(`تم التسجيل بنجاح! UID: ${result.uid}`);
    } catch (err: any) {
      setError(`خطأ في التسجيل: ${err.message}`);
    }
  };

  const handleTestLogin = async () => {
    try {
      setMessage('');
      setError('');
      
      const result = await login(testEmail, testPassword);
      
      setMessage(`تم تسجيل الدخول بنجاح! UID: ${result.user.uid}`);
    } catch (err: any) {
      setError(`خطأ في تسجيل الدخول: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setMessage('تم تسجيل الخروج بنجاح');
    } catch (err: any) {
      setError(`خطأ في تسجيل الخروج: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <h1 className="mb-8 text-3xl font-bold text-center">اختبار تدفق التسجيل</h1>
        
        {/* حالة المستخدم الحالي */}
        <div className="p-4 mb-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-xl font-semibold">حالة المستخدم الحالي:</h2>
          <div className="space-y-2 text-sm">
            <p><strong>مسجل دخول:</strong> {user ? 'نعم' : 'لا'}</p>
            {user && (
              <>
                <p><strong>UID:</strong> {user.uid}</p>
                <p><strong>البريد الإلكتروني:</strong> {user.email}</p>
              </>
            )}
            {userData && (
              <>
                <p><strong>نوع الحساب:</strong> {userData.accountType}</p>
                <p><strong>الاسم:</strong> {userData.full_name}</p>
                <p><strong>رقم الهاتف:</strong> {userData.phone}</p>
              </>
            )}
          </div>
        </div>

        {/* رسائل الحالة */}
        {message && (
          <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-lg">
            {message}
          </div>
        )}
        {error && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {/* نموذج الاختبار */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-xl font-semibold">بيانات الاختبار:</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1 text-sm font-medium">البريد الإلكتروني:</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">كلمة المرور:</label>
              <input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">الاسم:</label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">رقم الهاتف:</label>
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleTestRegistration}
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              اختبار التسجيل
            </button>
            <button
              onClick={handleTestLogin}
              className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
            >
              اختبار تسجيل الدخول
            </button>
            {user && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
              >
                تسجيل الخروج
              </button>
            )}
          </div>
        </div>

        {/* روابط سريعة */}
        <div className="mt-6 p-4 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-xl font-semibold">روابط سريعة:</h2>
          <div className="flex gap-4">
            <a
              href="/auth/register"
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
            >
              صفحة التسجيل
            </a>
            <a
              href="/auth/login"
              className="px-4 py-2 text-green-600 border border-green-600 rounded hover:bg-green-50"
            >
              صفحة تسجيل الدخول
            </a>
            <a
              href="/dashboard"
              className="px-4 py-2 text-purple-600 border border-purple-600 rounded hover:bg-purple-50"
            >
              لوحة التحكم
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 