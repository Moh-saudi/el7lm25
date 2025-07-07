'use client';

import React, { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { CheckCircle, AlertTriangle, Settings, Wrench } from 'lucide-react';

export default function FixFirebasePage() {
  const [status, setStatus] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
    console.log(logMessage);
  };

  const checkFirebaseSettings = async () => {
    setLoading(true);
    setLogs([]);
    addLog('🔍 بدء فحص إعدادات Firebase...');

    const results: any = {};

    // 1. Check Environment Variables
    addLog('📋 فحص متغيرات البيئة...');
    const envVars = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    const missingVars = Object.entries(envVars).filter(([key, value]) => !value);
    if (missingVars.length > 0) {
      addLog(`❌ متغيرات البيئة المفقودة: ${missingVars.map(([key]) => key).join(', ')}`, 'error');
      results.envVars = false;
    } else {
      addLog('✅ جميع متغيرات البيئة موجودة', 'success');
      results.envVars = true;
    }

    // 2. Test Firebase Auth Connection
    addLog('🔐 اختبار اتصال Firebase Auth...');
    try {
      // Try to get current auth state
      const currentUser = auth.currentUser;
      addLog(`📝 المستخدم الحالي: ${currentUser ? currentUser.email : 'لا يوجد مستخدم مسجل'}`, 'info');
      
      addLog(`🌐 Auth Domain: ${auth.config.authDomain}`, 'info');
      addLog(`🆔 Project ID: ${auth.app.options.projectId}`, 'info');
      
      results.authConnection = true;
      addLog('✅ اتصال Firebase Auth يعمل', 'success');
    } catch (error: any) {
      addLog(`❌ خطأ في اتصال Firebase Auth: ${error.message}`, 'error');
      results.authConnection = false;
    }

    // 3. Test Firestore Connection
    addLog('🗄️ اختبار اتصال Firestore...');
    try {
      const testDoc = doc(db, 'test-connection', 'test');
      await setDoc(testDoc, { timestamp: new Date(), test: true });
      await deleteDoc(testDoc);
      addLog('✅ اتصال Firestore يعمل', 'success');
      results.firestoreConnection = true;
    } catch (error: any) {
      addLog(`❌ خطأ في اتصال Firestore: ${error.message}`, 'error');
      results.firestoreConnection = false;
    }

    setStatus(results);
    setLoading(false);
    addLog('🏁 انتهى الفحص', 'info');
  };

  const testAuthentication = async () => {
    setLoading(true);
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    addLog('🧪 بدء اختبار التحقق من الهوية...');
    addLog(`📧 البريد الاختباري: ${testEmail}`);

    try {
      // Test Registration
      addLog('📝 اختبار التسجيل...');
      const registerResult = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      addLog(`✅ تم إنشاء المستخدم: ${registerResult.user.uid}`, 'success');

      // Test Login
      addLog('🔑 اختبار تسجيل الدخول...');
      await auth.signOut(); // Sign out first
      const loginResult = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      addLog(`✅ تم تسجيل الدخول: ${loginResult.user.uid}`, 'success');

      // Clean up
      addLog('🧹 تنظيف البيانات الاختبارية...');
      await deleteUser(loginResult.user);
      addLog('✅ تم حذف المستخدم الاختباري', 'success');

      addLog('🎉 جميع اختبارات التحقق نجحت!', 'success');

    } catch (error: any) {
      addLog(`❌ فشل اختبار التحقق: ${error.message}`, 'error');
      addLog(`🔍 كود الخطأ: ${error.code}`, 'error');
      
      if (error.code === 'auth/operation-not-allowed') {
        addLog('⚠️ تسجيل الحسابات غير مفعل في Firebase Console', 'error');
        addLog('📋 الحل: اذهب إلى Firebase Console > Authentication > Sign-in method > Email/Password > Enable', 'info');
      }
    }

    setLoading(false);
  };

  const getFirebaseConsoleUrl = () => {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (projectId) {
      return `https://console.firebase.google.com/project/${projectId}/authentication/providers`;
    }
    return 'https://console.firebase.google.com';
  };

  useEffect(() => {
    checkFirebaseSettings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <Wrench className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">إصلاح مشاكل Firebase</h1>
            <p className="text-gray-600">تشخيص وحل مشاكل التحقق من الهوية</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={checkFirebaseSettings}
              disabled={loading}
              className="py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
            >
              فحص الإعدادات
            </button>
            <button
              onClick={testAuthentication}
              disabled={loading}
              className="py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400"
            >
              اختبار التحقق
            </button>
            <a
              href={getFirebaseConsoleUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 text-center"
            >
              فتح Firebase Console
            </a>
          </div>

          {/* Status Overview */}
          {Object.keys(status).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${status.envVars ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2">
                  {status.envVars ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
                  <span className={`font-medium ${status.envVars ? 'text-green-800' : 'text-red-800'}`}>
                    متغيرات البيئة
                  </span>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${status.authConnection ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2">
                  {status.authConnection ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
                  <span className={`font-medium ${status.authConnection ? 'text-green-800' : 'text-red-800'}`}>
                    اتصال Authentication
                  </span>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${status.firestoreConnection ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2">
                  {status.firestoreConnection ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
                  <span className={`font-medium ${status.firestoreConnection ? 'text-green-800' : 'text-red-800'}`}>
                    اتصال Firestore
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">خطوات الإصلاح</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <div>
                <h3 className="font-semibold">تفعيل Email/Password Authentication</h3>
                <p className="text-gray-600 text-sm">اذهب إلى Firebase Console > Authentication > Sign-in method > Email/Password > Enable</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <div>
                <h3 className="font-semibold">تحديث Firestore Rules</h3>
                <p className="text-gray-600 text-sm">تأكد من أن قواعد Firestore تسمح بالقراءة والكتابة للمستخدمين المسجلين</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <div>
                <h3 className="font-semibold">التحقق من Authorized Domains</h3>
                <p className="text-gray-600 text-sm">تأكد من إضافة localhost و domain الخاص بك في Authorized domains</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-gray-900 text-green-400 rounded-xl p-6">
          <h2 className="text-white text-lg font-bold mb-4">سجل العمليات</h2>
          <div className="space-y-1 font-mono text-sm max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="whitespace-pre-wrap">
                {log}
              </div>
            ))}
            {loading && (
              <div className="text-yellow-400">⏳ جاري التنفيذ...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 