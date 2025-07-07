'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { CheckCircle, AlertCircle, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TestPasswordResetPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (log: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString('ar-SA')}: ${log}`]);
  };

  const handleTest = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');
    setIsSuccess(false);
    setLogs([]);

    if (!email) {
      setError('يرجى إدخال البريد الإلكتروني');
      setIsLoading(false);
      return;
    }

    try {
      addLog('🔄 بدء عملية إعادة تعيين كلمة المرور...');
      addLog(`📧 البريد الإلكتروني: ${email}`);
      
      await sendPasswordResetEmail(auth, email);
      
      addLog('✅ تم إرسال رابط إعادة تعيين كلمة المرور بنجاح');
      setIsSuccess(true);
      setMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
      
    } catch (error: any) {
      console.error('Password reset error:', error);
      addLog(`❌ خطأ: ${error.code} - ${error.message}`);
      
      switch (error.code) {
        case 'auth/user-not-found':
          setError('البريد الإلكتروني غير مسجل في النظام');
          addLog('❌ البريد الإلكتروني غير موجود في قاعدة البيانات');
          break;
        case 'auth/invalid-email':
          setError('البريد الإلكتروني غير صحيح');
          addLog('❌ تنسيق البريد الإلكتروني غير صحيح');
          break;
        case 'auth/too-many-requests':
          setError('تم إرسال طلبات كثيرة، يرجى المحاولة لاحقاً');
          addLog('❌ تم تجاوز حد الطلبات المسموح');
          break;
        default:
          setError('حدث خطأ أثناء إرسال رابط إعادة التعيين');
          addLog(`❌ خطأ غير متوقع: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">اختبار إعادة تعيين كلمة المرور</h1>
                <p className="text-gray-600">اختبر نظام Firebase لإعادة تعيين كلمة المرور</p>
              </div>
            </div>
            <Link
              href="/auth/login"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              العودة للتسجيل
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">نموذج الاختبار</h2>
            
            {/* Success Message */}
            {isSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                  <p className="text-sm text-green-800">{message}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 ml-2" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل بريدك الإلكتروني"
                  disabled={isLoading}
                />
              </div>

              <button
                onClick={handleTest}
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                    جاري الإرسال...
                  </div>
                ) : (
                  'اختبار إعادة تعيين كلمة المرور'
                )}
              </button>

              {/* Quick Test Buttons */}
              <div className="grid grid-cols-1 gap-2 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">اختبارات سريعة:</p>
                <button
                  onClick={() => setEmail('test@example.com')}
                  className="text-left px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  📧 بريد تجريبي: test@example.com
                </button>
                <button
                  onClick={() => setEmail('invalid-email')}
                  className="text-left px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  ❌ بريد غير صحيح: invalid-email
                </button>
                <button
                  onClick={() => setEmail('')}
                  className="text-left px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  🔄 مسح الحقل
                </button>
              </div>
            </div>
          </div>

          {/* Logs Panel */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">سجل العمليات</h2>
            <div className="bg-gray-50 rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-sm">لم يتم تسجيل أي عمليات بعد...</p>
              ) : (
                <div className="space-y-2">
                  {logs.map((log, index) => (
                    <div key={index} className="text-sm font-mono text-gray-700 p-2 bg-white rounded border-l-4 border-blue-500">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setLogs([])}
              className="mt-4 w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              مسح السجل
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">تعليمات الاختبار</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">✅ الحالات الناجحة:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• استخدم بريد إلكتروني مسجل في النظام</li>
                <li>• سيتم إرسال رابط إعادة التعيين فوراً</li>
                <li>• تحقق من صندوق الوارد ومجلد الرسائل غير المرغوب فيها</li>
                <li>• الرابط صالح لمدة ساعة واحدة</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">❌ الحالات الفاشلة:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• البريد الإلكتروني غير مسجل في النظام</li>
                <li>• تنسيق البريد الإلكتروني غير صحيح</li>
                <li>• تجاوز حد الطلبات المسموح (كثرة المحاولات)</li>
                <li>• مشاكل في الاتصال بالإنترنت</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Firebase Configuration Info */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">معلومات التكوين</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">🔧 إعدادات Firebase:</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• Firebase Auth مفعل</li>
                <li>• إعادة تعيين كلمة المرور مفعلة</li>
                <li>• قوالب البريد الإلكتروني مخصصة</li>
                <li>• النطاق المصرح به مُعرَّف</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">📧 إعدادات البريد:</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• المرسل: Firebase Auth</li>
                <li>• اللغة: العربية</li>
                <li>• التصميم: متجاوب</li>
                <li>• الأمان: مشفر</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 