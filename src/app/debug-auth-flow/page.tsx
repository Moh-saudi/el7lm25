'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { 
  Bug, 
  User, 
  Database, 
  Route, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

export default function DebugAuthFlowPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isDebugging, setIsDebugging] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString('ar-SA');
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    setLogs(prev => [...prev, `${timestamp} ${emoji[type]} ${message}`]);
  };

  const getDashboardRoute = (accountType: string) => {
    const routes = {
      'player': '/dashboard/player',
      'club': '/dashboard/club',
      'agent': '/dashboard/agent',
      'academy': '/dashboard/academy',
      'trainer': '/dashboard/trainer',
      'admin': '/dashboard/admin',
      'marketer': '/dashboard/marketer'
    };
    return routes[accountType as keyof typeof routes] || '/dashboard';
  };

  const runFullDiagnosis = async () => {
    setIsDebugging(true);
    setLogs([]);
    setDebugInfo({});

    addLog('🔍 بدء التشخيص الشامل...', 'info');

    try {
      // 1. فحص حالة المصادقة
      addLog('1️⃣ فحص حالة Firebase Auth...', 'info');
      
      if (!user) {
        addLog('❌ لا يوجد مستخدم مسجل دخوله', 'error');
        setDebugInfo(prev => ({ ...prev, authStatus: 'no-user' }));
        return;
      }

      addLog(`✅ المستخدم مسجل دخوله: ${user.email}`, 'success');
      addLog(`   - UID: ${user.uid}`, 'info');
      addLog(`   - Email Verified: ${user.emailVerified}`, 'info');
      
      setDebugInfo(prev => ({ 
        ...prev, 
        authStatus: 'authenticated',
        userInfo: {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime
        }
      }));

      // 2. فحص بيانات المستخدم من AuthProvider
      addLog('2️⃣ فحص بيانات المستخدم من AuthProvider...', 'info');
      
      if (!userData) {
        addLog('❌ لا توجد بيانات مستخدم في AuthProvider', 'error');
        setDebugInfo(prev => ({ ...prev, authProviderData: 'no-data' }));
      } else {
        addLog(`✅ بيانات المستخدم موجودة في AuthProvider`, 'success');
        addLog(`   - نوع الحساب: ${userData.accountType}`, 'info');
        addLog(`   - الاسم: ${userData.full_name || 'غير محدد'}`, 'info');
        addLog(`   - الهاتف: ${userData.phone || 'غير محدد'}`, 'info');
        
        setDebugInfo(prev => ({ 
          ...prev, 
          authProviderData: 'available',
          userData: userData
        }));
      }

      // 3. فحص وثيقة المستخدم في Firestore مباشرة
      addLog('3️⃣ فحص وثيقة المستخدم في Firestore...', 'info');
      
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          addLog('❌ وثيقة المستخدم غير موجودة في users collection', 'error');
          setDebugInfo(prev => ({ ...prev, firestoreUserDoc: 'not-found' }));
        } else {
          const firestoreData = userDoc.data();
          addLog(`✅ وثيقة المستخدم موجودة في Firestore`, 'success');
          addLog(`   - نوع الحساب: ${firestoreData.accountType}`, 'info');
          addLog(`   - تاريخ الإنشاء: ${firestoreData.created_at?.toDate?.() || 'غير محدد'}`, 'info');
          
          setDebugInfo(prev => ({ 
            ...prev, 
            firestoreUserDoc: 'found',
            firestoreData: firestoreData
          }));
        }
      } catch (firestoreError) {
        addLog(`❌ خطأ في الوصول لـ Firestore: ${firestoreError}`, 'error');
        setDebugInfo(prev => ({ ...prev, firestoreError: firestoreError }));
      }

      // 4. فحص المسار الحالي والمسار المتوقع
      addLog('4️⃣ فحص المسارات...', 'info');
      
      const currentPath = window.location.pathname;
      const expectedPath = userData ? getDashboardRoute(userData.accountType) : 'غير محدد';
      
      addLog(`   - المسار الحالي: ${currentPath}`, 'info');
      addLog(`   - المسار المتوقع: ${expectedPath}`, 'info');
      
      if (currentPath === expectedPath) {
        addLog('✅ المستخدم في المسار الصحيح', 'success');
      } else {
        addLog('⚠️ المستخدم ليس في المسار المتوقع', 'warning');
      }
      
      setDebugInfo(prev => ({ 
        ...prev, 
        routing: {
          currentPath,
          expectedPath,
          isCorrectPath: currentPath === expectedPath
        }
      }));

      // 5. فحص localStorage
      addLog('5️⃣ فحص localStorage...', 'info');
      
      const localStorageData = {
        rememberMe: localStorage.getItem('rememberMe'),
        userEmail: localStorage.getItem('userEmail'),
        accountType: localStorage.getItem('accountType'),
        pendingEmailVerification: localStorage.getItem('pendingEmailVerification')
      };
      
      addLog(`   - Remember Me: ${localStorageData.rememberMe}`, 'info');
      addLog(`   - User Email: ${localStorageData.userEmail}`, 'info');
      addLog(`   - Account Type: ${localStorageData.accountType}`, 'info');
      
      setDebugInfo(prev => ({ 
        ...prev, 
        localStorage: localStorageData
      }));

      // 6. فحص حالة التحميل
      addLog('6️⃣ فحص حالة التحميل...', 'info');
      addLog(`   - AuthProvider loading: ${loading}`, 'info');
      
      setDebugInfo(prev => ({ 
        ...prev, 
        loadingStates: {
          authProvider: loading
        }
      }));

      addLog('🎉 انتهى التشخيص الشامل', 'success');

    } catch (error) {
      addLog(`❌ خطأ أثناء التشخيص: ${error}`, 'error');
      setDebugInfo(prev => ({ ...prev, diagnosisError: error }));
    } finally {
      setIsDebugging(false);
    }
  };

  const forceRedirect = () => {
    if (userData) {
      const route = getDashboardRoute(userData.accountType);
      addLog(`🚀 إجبار التوجيه إلى: ${route}`, 'info');
      router.push(route);
    } else {
      addLog('❌ لا يمكن التوجيه - لا توجد بيانات مستخدم', 'error');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    // تشغيل التشخيص تلقائياً عند تحميل الصفحة
    if (!loading) {
      setTimeout(runFullDiagnosis, 1000);
    }
  }, [loading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <Bug className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">تشخيص مشكلة التوجيه</h1>
                <p className="text-gray-600">فحص شامل لمشكلة عدم توجيه المستخدمين إلى لوحات التحكم</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={runFullDiagnosis}
                disabled={isDebugging}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isDebugging ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Bug className="h-4 w-4" />}
                {isDebugging ? 'جاري التشخيص...' : 'تشخيص شامل'}
              </button>
              <button
                onClick={forceRedirect}
                disabled={!userData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
                إجبار التوجيه
              </button>
              <button
                onClick={clearLogs}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                مسح السجل
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Info */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              المعلومات السريعة
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${user ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <p className="font-medium">حالة المصادقة</p>
                  <p className="text-sm text-gray-600">{user ? 'مسجل دخوله' : 'غير مسجل'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${userData ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <p className="font-medium">بيانات المستخدم</p>
                  <p className="text-sm text-gray-600">{userData ? `${userData.accountType}` : 'غير متوفرة'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                <div>
                  <p className="font-medium">حالة التحميل</p>
                  <p className="text-sm text-gray-600">{loading ? 'جاري التحميل...' : 'مكتمل'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Route className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">المسار الحالي</p>
                  <p className="text-sm text-gray-600 font-mono">{typeof window !== 'undefined' ? window.location.pathname : 'غير محدد'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Logs */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              سجل التشخيص
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-sm">لم يتم تسجيل أي عمليات بعد...</p>
              ) : (
                <div className="space-y-2">
                  {logs.map((log, index) => (
                    <div key={index} className="text-sm font-mono text-gray-700 p-2 bg-white rounded border-l-4 border-red-500">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Debug Info */}
        {Object.keys(debugInfo).length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="h-5 w-5" />
              معلومات التشخيص التفصيلية
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Auth Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  حالة المصادقة
                </h3>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                  {JSON.stringify(debugInfo.authStatus, null, 2)}
                </pre>
              </div>

              {/* AuthProvider Data */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  بيانات AuthProvider
                </h3>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                  {JSON.stringify(debugInfo.authProviderData, null, 2)}
                </pre>
              </div>

              {/* Firestore Data */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  بيانات Firestore
                </h3>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                  {JSON.stringify(debugInfo.firestoreUserDoc, null, 2)}
                </pre>
              </div>

              {/* Routing Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <Route className="h-4 w-4" />
                  معلومات التوجيه
                </h3>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                  {JSON.stringify(debugInfo.routing, null, 2)}
                </pre>
              </div>

              {/* LocalStorage */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  LocalStorage
                </h3>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                  {JSON.stringify(debugInfo.localStorage, null, 2)}
                </pre>
              </div>

              {/* Loading States */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  حالات التحميل
                </h3>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                  {JSON.stringify(debugInfo.loadingStates, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Solutions */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            الحلول المقترحة
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">إذا كان المستخدم عالق في صفحة التحميل:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• تحقق من أن بيانات المستخدم موجودة في Firestore</li>
                <li>• تأكد من أن AuthProvider يحمل البيانات بشكل صحيح</li>
                <li>• فحص وجود أخطاء في console</li>
              </ul>
            </div>
            
            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">إذا كان التوجيه لا يعمل:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• تحقق من صحة نوع الحساب في البيانات</li>
                <li>• فحص دالة getDashboardRoute</li>
                <li>• تأكد من وجود صفحات لوحة التحكم</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 