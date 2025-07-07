'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Shield, 
  Users, 
  Trophy, 
  Building, 
  GraduationCap, 
  UserCheck,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface TestAccount {
  email: string;
  password: string;
  accountType: string;
  expectedRoute: string;
  icon: any;
  label: string;
  color: string;
}

export default function TestDashboardRedirectPage() {
  const { user, userData, loading: authLoading, login, logout } = useAuth();
  const router = useRouter();
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const testAccounts: TestAccount[] = [
    {
      email: 'player@test.com',
      password: 'test123456',
      accountType: 'player',
      expectedRoute: '/dashboard/player',
      icon: User,
      label: 'لاعب',
      color: 'blue'
    },
    {
      email: 'club@test.com',
      password: 'test123456',
      accountType: 'club',
      expectedRoute: '/dashboard/club',
      icon: Shield,
      label: 'نادي',
      color: 'green'
    },
    {
      email: 'agent@test.com',
      password: 'test123456',
      accountType: 'agent',
      expectedRoute: '/dashboard/agent',
      icon: Users,
      label: 'وكيل',
      color: 'purple'
    },
    {
      email: 'academy@test.com',
      password: 'test123456',
      accountType: 'academy',
      expectedRoute: '/dashboard/academy',
      icon: GraduationCap,
      label: 'أكاديمية',
      color: 'orange'
    },
    {
      email: 'trainer@test.com',
      password: 'test123456',
      accountType: 'trainer',
      expectedRoute: '/dashboard/trainer',
      icon: Trophy,
      label: 'مدرب',
      color: 'cyan'
    },
    {
      email: 'admin@el7hm.com',
      password: 'admin123456',
      accountType: 'admin',
      expectedRoute: '/dashboard/admin',
      icon: Building,
      label: 'أدمن',
      color: 'red'
    }
  ];

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ar-SA');
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const testAccountLogin = async (account: TestAccount) => {
    setCurrentTest(account.accountType);
    addLog(`🔄 بدء اختبار حساب ${account.label}...`);
    
    try {
      // تسجيل خروج أولاً إذا كان هناك مستخدم
      if (user) {
        await logout();
        addLog('🚪 تم تسجيل الخروج من الحساب السابق');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      addLog(`📧 محاولة تسجيل الدخول: ${account.email}`);
      
      const result = await login(account.email, account.password);
      
      addLog(`✅ نجح تسجيل الدخول - UID: ${result.user.uid}`);
      addLog(`📋 نوع الحساب: ${result.userData.accountType}`);
      addLog(`🎯 المسار المتوقع: ${account.expectedRoute}`);

      // انتظار قليل للتأكد من تحديث البيانات
      await new Promise(resolve => setTimeout(resolve, 2000));

      // فحص التوجيه
      const currentPath = window.location.pathname;
      addLog(`📍 المسار الحالي: ${currentPath}`);

      const testResult = {
        success: true,
        accountType: result.userData.accountType,
        expectedRoute: account.expectedRoute,
        currentRoute: currentPath,
        redirectWorking: currentPath === account.expectedRoute,
        userData: result.userData,
        timestamp: new Date().toISOString()
      };

      if (testResult.redirectWorking) {
        addLog('✅ التوجيه يعمل بشكل صحيح!');
      } else {
        addLog('❌ التوجيه لا يعمل - لم يتم الانتقال للمسار المتوقع');
      }

      setTestResults(prev => ({
        ...prev,
        [account.accountType]: testResult
      }));

    } catch (error: any) {
      addLog(`❌ فشل اختبار ${account.label}: ${error.message}`);
      
      setTestResults(prev => ({
        ...prev,
        [account.accountType]: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setCurrentTest(null);
    }
  };

  const testAllAccounts = async () => {
    addLog('🚀 بدء اختبار جميع الحسابات...');
    setTestResults({});
    
    for (const account of testAccounts) {
      await testAccountLogin(account);
      await new Promise(resolve => setTimeout(resolve, 3000)); // انتظار بين الاختبارات
    }
    
    addLog('🏁 انتهاء اختبار جميع الحسابات');
  };

  const navigateToDashboard = (route: string) => {
    addLog(`🚀 التنقل يدوياً إلى: ${route}`);
    router.push(route);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      cyan: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      red: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">اختبار توجيه لوحات التحكم</h1>
                <p className="text-gray-600">فحص توجيه جميع أنواع الحسابات إلى لوحات التحكم المناسبة</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={testAllAccounts}
                disabled={currentTest !== null}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {currentTest ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                اختبار جميع الحسابات
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

        {/* Current User Info */}
        {user && userData && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">المستخدم الحالي</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">نوع الحساب</p>
                <p className="font-medium">{userData.accountType}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">المسار الحالي</p>
                <p className="font-medium">{window.location.pathname}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Accounts */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">الحسابات التجريبية</h2>
            <div className="space-y-3">
              {testAccounts.map((account) => {
                const Icon = account.icon;
                const result = testResults[account.accountType];
                
                return (
                  <div key={account.accountType} className={`border rounded-lg p-4 ${getColorClasses(account.color)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <h3 className="font-medium">{account.label}</h3>
                          <p className="text-xs opacity-75">{account.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {result && (
                          <div className="flex items-center gap-1">
                            {result.success ? (
                              result.redirectWorking ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                              )
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => testAccountLogin(account)}
                          disabled={currentTest === account.accountType}
                          className="px-3 py-1 bg-white bg-opacity-50 rounded text-xs hover:bg-opacity-75 disabled:opacity-50 transition-colors"
                        >
                          {currentTest === account.accountType ? 'جاري الاختبار...' : 'اختبار'}
                        </button>
                        <button
                          onClick={() => navigateToDashboard(account.expectedRoute)}
                          className="px-3 py-1 bg-white bg-opacity-50 rounded text-xs hover:bg-opacity-75 transition-colors"
                        >
                          انتقال
                        </button>
                      </div>
                    </div>
                    
                    {result && (
                      <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                        <div className="text-xs space-y-1">
                          <p><strong>الحالة:</strong> {result.success ? 'نجح' : 'فشل'}</p>
                          {result.success && (
                            <>
                              <p><strong>نوع الحساب:</strong> {result.accountType}</p>
                              <p><strong>التوجيه:</strong> {result.redirectWorking ? 'يعمل' : 'لا يعمل'}</p>
                              <p><strong>المسار المتوقع:</strong> {result.expectedRoute}</p>
                              <p><strong>المسار الحالي:</strong> {result.currentRoute}</p>
                            </>
                          )}
                          {result.error && (
                            <p><strong>الخطأ:</strong> {result.error}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logs Panel */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">سجل الاختبارات</h2>
            <div className="bg-gray-50 rounded-lg p-4 min-h-[400px] max-h-[500px] overflow-y-auto">
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
          </div>
        </div>

        {/* Dashboard Routes */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">لوحات التحكم المتاحة</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {testAccounts.map((account) => {
              const Icon = account.icon;
              return (
                <button
                  key={account.accountType}
                  onClick={() => navigateToDashboard(account.expectedRoute)}
                  className={`p-4 rounded-lg border-2 transition-colors hover:shadow-md ${getColorClasses(account.color)}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{account.label}</span>
                    <ArrowRight className="h-3 w-3 opacity-50" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Test Summary */}
        {Object.keys(testResults).length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">ملخص الاختبارات</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">الاختبارات الناجحة</h3>
                <p className="text-2xl font-bold text-green-600">
                  {Object.values(testResults).filter((r: any) => r.success && r.redirectWorking).length}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-2">التوجيه لا يعمل</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {Object.values(testResults).filter((r: any) => r.success && !r.redirectWorking).length}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-medium text-red-800 mb-2">الاختبارات الفاشلة</h3>
                <p className="text-2xl font-bold text-red-600">
                  {Object.values(testResults).filter((r: any) => !r.success).length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 