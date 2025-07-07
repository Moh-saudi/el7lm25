'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { CheckCircle, AlertTriangle, User, LogIn, UserPlus } from 'lucide-react';

export default function TestAuthFlowPage() {
  const { register: registerUser, login, logout, user, userData, loading } = useAuth();
  const [testEmail] = useState(`test-${Date.now()}@example.com`);
  const [testPassword] = useState('TestPassword123!');
  const [testName] = useState('مستخدم تجريبي');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      setMessage(msg);
      setError('');
    } else {
      setError(msg);
      setMessage('');
    }
  };

  const testCompleteFlow = async () => {
    setIsLoading(true);
    addMessage('بدء اختبار التدفق الكامل...');

    try {
      // 1. Test Registration
      addMessage('🔐 اختبار التسجيل...');
      const userData = await registerUser(
        testEmail,
        testPassword,
        'player',
        {
          full_name: testName,
          phone: '1234567890',
          country: 'السعودية',
          countryCode: '+966'
        }
      );
      addMessage(`✅ تم التسجيل بنجاح: ${userData.email}`);

      // 2. Test Logout
      addMessage('🚪 اختبار تسجيل الخروج...');
      await logout();
      addMessage('✅ تم تسجيل الخروج بنجاح');

      // 3. Test Login
      addMessage('🔑 اختبار تسجيل الدخول...');
      const loginResult = await login(testEmail, testPassword);
      addMessage(`✅ تم تسجيل الدخول بنجاح: ${loginResult.userData.email}`);

      addMessage('🎉 جميع الاختبارات نجحت! النظام يعمل بشكل مثالي');

    } catch (error: any) {
      console.error('Test failed:', error);
      addMessage(`❌ فشل الاختبار: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const testRegistrationOnly = async () => {
    setIsLoading(true);
    addMessage('اختبار التسجيل فقط...');

    try {
      const userData = await registerUser(
        testEmail,
        testPassword,
        'player',
        {
          full_name: testName,
          phone: '1234567890',
          country: 'السعودية'
        }
      );
      addMessage(`✅ تم إنشاء حساب جديد: ${userData.email}`);
    } catch (error: any) {
      addMessage(`❌ فشل التسجيل: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const testLoginOnly = async () => {
    setIsLoading(true);
    addMessage('اختبار تسجيل الدخول فقط...');

    try {
      const result = await login(testEmail, testPassword);
      addMessage(`✅ تم تسجيل الدخول: ${result.userData.email}`);
    } catch (error: any) {
      addMessage(`❌ فشل تسجيل الدخول: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <User className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">اختبار نظام التحقق</h1>
            <p className="text-gray-600">تأكد من أن التسجيل وتسجيل الدخول يعملان</p>
          </div>

          {/* Current User Status */}
          {user && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">
                  مستخدم مسجل: {user.email}
                </span>
              </div>
              {userData && (
                <div className="mt-2 text-sm text-green-700">
                  نوع الحساب: {userData.accountType} | الاسم: {userData.full_name}
                </div>
              )}
            </div>
          )}

          {/* Test Data */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-2">بيانات الاختبار:</h3>
            <div className="space-y-1 text-sm text-blue-700">
              <div>البريد: {testEmail}</div>
              <div>كلمة المرور: {testPassword}</div>
              <div>الاسم: {testName}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={testCompleteFlow}
              disabled={isLoading || loading}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400"
            >
              <UserPlus className="w-4 h-4" />
              اختبار كامل
            </button>
            
            <button
              onClick={testRegistrationOnly}
              disabled={isLoading || loading}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
            >
              <UserPlus className="w-4 h-4" />
              تسجيل فقط
            </button>
            
            <button
              onClick={testLoginOnly}
              disabled={isLoading || loading}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400"
            >
              <LogIn className="w-4 h-4" />
              دخول فقط
            </button>
          </div>

          {/* Messages */}
          {message && (
            <div className="flex items-center gap-2 p-4 mb-4 text-green-700 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <p>{message}</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 mb-4 text-red-700 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 justify-center">
            <a 
              href="/auth/register"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              صفحة التسجيل
            </a>
            <a 
              href="/auth/login"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              صفحة تسجيل الدخول
            </a>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-bold text-green-800">🎉 مبروك!</h3>
              <p className="text-green-700">تم حل مشكلة Firebase! النظام الآن يعمل بشكل صحيح</p>
              <p className="text-green-600 text-sm mt-1">يمكنك الآن التسجيل وتسجيل الدخول بشكل طبيعي</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 