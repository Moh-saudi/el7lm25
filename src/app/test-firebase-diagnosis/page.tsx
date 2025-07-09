'use client';

import { useState, useEffect } from 'react';
import { auth, firebaseConfig, hasValidConfig } from '@/lib/firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  Shield,
  User as UserIcon,
  Mail,
  Lock,
  Settings
} from 'lucide-react';

export default function FirebaseDiagnosisPage() {
  const [diagnosis, setDiagnosis] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [testResults, setTestResults] = useState<any>({});

  useEffect(() => {
    runDiagnosis();
    
    // مراقبة حالة المصادقة
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const runDiagnosis = async () => {
    setLoading(true);
    const results: any = {};

    // 1. فحص متغيرات البيئة
    results.envVars = {
      apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: !!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };

    // 2. فحص تكوين Firebase
    results.config = {
      hasValidConfig,
      configValues: {
        apiKey: firebaseConfig.apiKey ? '✅ Set' : '❌ Missing',
        authDomain: firebaseConfig.authDomain ? '✅ Set' : '❌ Missing',
        projectId: firebaseConfig.projectId ? '✅ Set' : '❌ Missing',
        storageBucket: firebaseConfig.storageBucket ? '✅ Set' : '❌ Missing',
        messagingSenderId: firebaseConfig.messagingSenderId ? '✅ Set' : '❌ Missing',
        appId: firebaseConfig.appId ? '✅ Set' : '❌ Missing',
        measurementId: firebaseConfig.measurementId ? '✅ Set' : '❌ Missing'
      }
    };

    // 3. فحص حالة Auth
    results.auth = {
      initialized: !!auth,
      currentUser: !!user,
      authDomain: firebaseConfig.authDomain
    };

    // 4. فحص الاتصال بالإنترنت
    results.network = {
      online: navigator.onLine,
      userAgent: navigator.userAgent
    };

    setDiagnosis(results);
    setLoading(false);
  };

  const runAuthTests = async () => {
    setTesting(true);
    const results: any = {};

    try {
      // اختبار 1: محاولة تسجيل دخول بحساب غير موجود
      console.log('🧪 Testing: Sign in with non-existent account');
      try {
        await signInWithEmailAndPassword(auth, 'test@nonexistent.com', 'wrongpassword');
        results.nonExistentSignIn = { success: false, error: 'Unexpected success' };
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          results.nonExistentSignIn = { success: true, error: error.code };
        } else {
          results.nonExistentSignIn = { success: false, error: error.code };
        }
      }

      // اختبار 2: محاولة إنشاء حساب جديد
      console.log('🧪 Testing: Create new account');
      const testEmail = `test-${Date.now()}@example.com`;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, testEmail, 'testpassword123');
        results.createAccount = { success: true, uid: userCredential.user.uid };
        
        // حذف الحساب التجريبي
        await userCredential.user.delete();
        console.log('🧹 Cleaned up test account');
      } catch (error: any) {
        results.createAccount = { success: false, error: error.code };
      }

      // اختبار 3: تسجيل الخروج
      console.log('🧪 Testing: Sign out');
      try {
        await signOut(auth);
        results.signOut = { success: true };
      } catch (error: any) {
        results.signOut = { success: false, error: error.code };
      }

    } catch (error: any) {
      console.error('❌ Auth tests failed:', error);
      results.generalError = error.message;
    }

    setTestResults(results);
    setTesting(false);
  };

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>جاري تشخيص Firebase...</p>
      </div>
    </div>
  );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">تشخيص Firebase</h1>
          </div>
          <p className="text-gray-600">
            فحص شامل لإعدادات Firebase Authentication والتكوين
          </p>
        </div>

        {/* Environment Variables */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">متغيرات البيئة</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(diagnosis.envVars || {}).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                {getStatusIcon(value as boolean)}
                <span className={`font-medium ${getStatusColor(value as boolean)}`}>
                  {key}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Firebase Configuration */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">تكوين Firebase</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(diagnosis.config?.hasValidConfig)}
              <span className={`font-medium ${getStatusColor(diagnosis.config?.hasValidConfig)}`}>
                التكوين صالح: {diagnosis.config?.hasValidConfig ? 'نعم' : 'لا'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(diagnosis.config?.configValues || {}).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-700">{key}:</span>
                  <span className="text-sm">{value as string}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Authentication Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <UserIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">حالة المصادقة</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(diagnosis.auth?.initialized)}
              <span className={`font-medium ${getStatusColor(diagnosis.auth?.initialized)}`}>
                Firebase Auth مُهيأ: {diagnosis.auth?.initialized ? 'نعم' : 'لا'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(!!user)}
              <span className={`font-medium ${getStatusColor(!!user)}`}>
                مستخدم مسجل دخول: {user ? 'نعم' : 'لا'}
              </span>
            </div>
            {user && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>البريد الإلكتروني:</strong> {user.email}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>معرف المستخدم:</strong> {user.uid}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Network Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">حالة الشبكة</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(diagnosis.network?.online)}
              <span className={`font-medium ${getStatusColor(diagnosis.network?.online)}`}>
                متصل بالإنترنت: {diagnosis.network?.online ? 'نعم' : 'لا'}
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>متصفح:</strong> {diagnosis.network?.userAgent}
              </p>
            </div>
          </div>
          </div>

        {/* Auth Tests */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lock className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">اختبارات المصادقة</h2>
            </div>
            <button
              onClick={runAuthTests}
              disabled={testing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الاختبار...
                </>
              ) : (
                'تشغيل الاختبارات'
              )}
            </button>
          </div>

          {Object.keys(testResults).length > 0 && (
            <div className="space-y-3">
              {Object.entries(testResults).map(([test, result]: [string, any]) => (
                <div key={test} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(result.success)}
                    <span className="font-medium">
                      {test === 'nonExistentSignIn' && 'تسجيل دخول بحساب غير موجود'}
                      {test === 'createAccount' && 'إنشاء حساب جديد'}
                      {test === 'signOut' && 'تسجيل الخروج'}
                      {test === 'generalError' && 'خطأ عام'}
                </span>
              </div>
                  <div className="text-sm text-gray-600">
                    {result.success ? (
                      <span className="text-green-600">✅ نجح الاختبار</span>
                    ) : (
                      <span className="text-red-600">❌ فشل الاختبار: {result.error}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl font-semibold">التوصيات</h2>
          </div>
          <div className="space-y-3">
            {!diagnosis.config?.hasValidConfig && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-medium text-red-800 mb-2">❌ مشكلة في التكوين</h3>
                <p className="text-sm text-red-700">
                  تأكد من تعيين جميع متغيرات Firebase في ملف .env.local
                </p>
              </div>
            )}
            
            {!diagnosis.auth?.initialized && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-medium text-red-800 mb-2">❌ مشكلة في Firebase Auth</h3>
                <p className="text-sm text-red-700">
                  Firebase Authentication غير مُهيأ بشكل صحيح
                </p>
              </div>
            )}

            {!diagnosis.network?.online && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-2">⚠️ مشكلة في الاتصال</h3>
                <p className="text-sm text-yellow-700">
                  تأكد من اتصالك بالإنترنت
                </p>
              </div>
            )}

            {diagnosis.config?.hasValidConfig && diagnosis.auth?.initialized && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">✅ كل شيء يعمل بشكل صحيح</h3>
                <p className="text-sm text-green-700">
                  Firebase مُهيأ بشكل صحيح وجاهز للاستخدام
                </p>
              </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
} 