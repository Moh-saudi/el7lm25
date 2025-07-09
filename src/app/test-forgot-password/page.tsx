'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TestForgotPasswordPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testForgotPasswordFlow = async () => {
    addTestResult('🧪 بدء اختبار صفحة نسيت كلمة المرور...');
    
    try {
      // اختبار الوصول للصفحة
      const response = await fetch('/auth/forgot-password');
      if (response.ok) {
        addTestResult('✅ صفحة نسيت كلمة المرور متاحة');
      } else {
        addTestResult('❌ خطأ في الوصول لصفحة نسيت كلمة المرور');
      }
    } catch (error) {
      addTestResult(`❌ خطأ في اختبار الصفحة: ${error}`);
    }
  };

  const testResetPasswordAPI = async () => {
    addTestResult('🧪 اختبار API إعادة تعيين كلمة المرور...');
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: '+966501234567',
          newPassword: 'testpassword123',
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        addTestResult('✅ API يعمل بشكل صحيح');
        addTestResult(`📝 الرسالة: ${data.message}`);
      } else {
        addTestResult(`❌ خطأ في API: ${data.error}`);
      }
    } catch (error) {
      addTestResult(`❌ خطأ في اختبار API: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            اختبار صفحة نسيت كلمة المرور
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">الاختبارات</h2>
              
              <button
                onClick={testForgotPasswordFlow}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                اختبار صفحة نسيت كلمة المرور
              </button>
              
              <button
                onClick={testResetPasswordAPI}
                className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                اختبار API إعادة تعيين كلمة المرور
              </button>
              
              <button
                onClick={clearResults}
                className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                مسح النتائج
              </button>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">روابط سريعة</h2>
              
              <Link
                href="/auth/forgot-password"
                className="block w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center"
              >
                صفحة نسيت كلمة المرور
              </Link>
              
              <Link
                href="/auth/login"
                className="block w-full py-2 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-center"
              >
                صفحة تسجيل الدخول
              </Link>
              
              <Link
                href="/auth/register"
                className="block w-full py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-center"
              >
                صفحة التسجيل
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">نتائج الاختبار</h2>
            
            {testResults.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-center">
                لا توجد نتائج اختبار بعد. اضغط على أحد الأزرار أعلاه لبدء الاختبار.
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-sm ${
                      result.includes('✅') 
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : result.includes('❌')
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">معلومات عن صفحة نسيت كلمة المرور:</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• تستخدم منطق OTP بدلاً من إرسال رابط عبر البريد الإلكتروني</li>
              <li>• تدعم SMS لمصر و WhatsApp لباقي الدول</li>
              <li>• تتحقق من وجود المستخدم برقم الهاتف</li>
              <li>• تسمح بإدخال كلمة مرور جديدة بعد التحقق</li>
              <li>• تستخدم نفس مكون UnifiedOTPVerification المستخدم في التسجيل</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 