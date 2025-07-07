'use client';

import React, { useState, useEffect } from 'react';
import { auth, firebaseConfig, hasValidConfig, missingVars } from '@/lib/firebase/config';
import { signInAnonymously, signOut } from 'firebase/auth';
import { CheckCircle, AlertTriangle, Settings, User, Database, HardDrive } from 'lucide-react';

export default function FirebaseTestPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // مراقبة حالة المستخدم
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleTestAuth = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await signInAnonymously(auth);
      setMessage('✅ تم تسجيل الدخول بنجاح!');
    } catch (err: any) {
      setError(`❌ فشل في تسجيل الدخول: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await signOut(auth);
      setMessage('✅ تم تسجيل الخروج بنجاح!');
    } catch (err: any) {
      setError(`❌ فشل في تسجيل الخروج: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-purple-50" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">اختبار Firebase</h1>
          <p className="text-gray-600">التحقق من إعدادات Firebase واختبار الخدمات</p>
        </div>

        {/* حالة الإعدادات */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">حالة إعدادات Firebase</h2>
          </div>
          
          {hasValidConfig ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <p className="font-medium">✅ جميع إعدادات Firebase صحيحة!</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <p className="font-medium">❌ إعدادات Firebase غير مكتملة!</p>
              </div>
              <div className="mt-2 text-sm">
                <p>المتغيرات المفقودة: {missingVars.join(', ')}</p>
              </div>
            </div>
          )}

          {/* تفاصيل الإعدادات */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">تفاصيل الإعدادات:</h3>
              <div className="text-sm space-y-1">
                <p><strong>API Key:</strong> {firebaseConfig.apiKey ? '✅ متوفر' : '❌ مفقود'}</p>
                <p><strong>Auth Domain:</strong> {firebaseConfig.authDomain ? '✅ متوفر' : '❌ مفقود'}</p>
                <p><strong>Project ID:</strong> {firebaseConfig.projectId ? '✅ متوفر' : '❌ مفقود'}</p>
                <p><strong>Storage Bucket:</strong> {firebaseConfig.storageBucket ? '✅ متوفر' : '❌ مفقود'}</p>
                <p><strong>Messaging Sender ID:</strong> {firebaseConfig.messagingSenderId ? '✅ متوفر' : '❌ مفقود'}</p>
                <p><strong>App ID:</strong> {firebaseConfig.appId ? '✅ متوفر' : '❌ مفقود'}</p>
                <p><strong>Measurement ID:</strong> {firebaseConfig.measurementId ? '✅ متوفر' : '❌ مفقود'}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">قيم الإعدادات:</h3>
              <div className="text-sm space-y-1">
                <p><strong>Project ID:</strong> {firebaseConfig.projectId || 'غير محدد'}</p>
                <p><strong>Auth Domain:</strong> {firebaseConfig.authDomain || 'غير محدد'}</p>
                <p><strong>Storage Bucket:</strong> {firebaseConfig.storageBucket || 'غير محدد'}</p>
                <p><strong>Messaging Sender ID:</strong> {firebaseConfig.messagingSenderId || 'غير محدد'}</p>
                <p><strong>App ID:</strong> {firebaseConfig.appId || 'غير محدد'}</p>
                <p><strong>Measurement ID:</strong> {firebaseConfig.measurementId || 'غير محدد'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* رسائل الحالة */}
        {message && (
          <div className="flex items-center gap-2 p-4 mb-6 text-green-700 bg-green-100 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <p>{message}</p>
          </div>
        )}
        
        {error && (
          <div className="flex items-center gap-2 p-4 mb-6 text-red-700 bg-red-100 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {/* اختبار المصادقة */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold">اختبار المصادقة</h2>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">حالة المستخدم الحالي:</p>
            {user ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  <strong>مستخدم مسجل:</strong> {user.uid}
                </p>
                <p className="text-sm text-green-600">
                  نوع الحساب: {user.isAnonymous ? 'مجهول' : 'مسجل'}
                </p>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-800">لا يوجد مستخدم مسجل</p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleTestAuth}
              disabled={loading || !hasValidConfig}
              className="flex items-center gap-2 px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <User className="w-5 h-5" />
              {loading ? 'جاري الاختبار...' : 'تسجيل دخول تجريبي'}
            </button>
            
            {user && (
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                تسجيل خروج
              </button>
            )}
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">معلومات إضافية</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Firestore</h3>
              </div>
              <p className="text-sm text-gray-600">قاعدة البيانات في الوقت الفعلي</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold">Authentication</h3>
              </div>
              <p className="text-sm text-gray-600">إدارة المستخدمين والمصادقة</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold">Storage</h3>
              </div>
              <p className="text-sm text-gray-600">تخزين الملفات والوسائط</p>
            </div>
          </div>
        </div>

        {/* روابط سريعة */}
        <div className="mt-6 p-4 bg-white rounded-lg shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">روابط سريعة</h2>
          <div className="flex flex-wrap gap-4">
            <a
              href="/test-emailjs-quick"
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
            >
              اختبار EmailJS
            </a>
            <a
              href="/auth/register"
              className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50"
            >
              صفحة التسجيل
            </a>
            <a
              href="/emailjs-setup"
              className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50"
            >
              إعدادات EmailJS
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 