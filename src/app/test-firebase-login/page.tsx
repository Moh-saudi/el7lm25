'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Phone, 
  Mail, 
  User, 
  Shield,
  Loader2,
  Search,
  Database,
  Key
} from 'lucide-react';

export default function TestFirebaseLoginPage() {
  const { login, register, user, userData, loading } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const addTestResult = (test: string, success: boolean, details: string, data?: any) => {
    setTestResults(prev => [...prev, {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      test,
      success,
      details,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // اختبار البحث عن البريد الإلكتروني المؤقت برقم الهاتف
  const testFindEmailByPhone = async () => {
    if (!searchPhone.trim()) {
      addTestResult('البحث عن البريد الإلكتروني', false, 'يرجى إدخال رقم الهاتف');
      return;
    }

    setLoadingSearch(true);
    try {
      console.log('🔍 Searching for Firebase email with phone:', searchPhone);
      
      // البحث في مجموعة المستخدمين
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phone', '==', searchPhone));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        console.log('✅ Found user with phone:', userData);
        
        setSearchResults({
          uid: userDoc.id,
          ...userData
        });
        
        addTestResult(
          'البحث عن البريد الإلكتروني', 
          true, 
          `تم العثور على المستخدم برقم الهاتف ${searchPhone}`,
          {
            firebaseEmail: userData.firebaseEmail || userData.email,
            originalEmail: userData.originalEmail,
            accountType: userData.accountType,
            full_name: userData.full_name
          }
        );
      } else {
        setSearchResults(null);
        addTestResult(
          'البحث عن البريد الإلكتروني', 
          false, 
          `لم يتم العثور على مستخدم برقم الهاتف ${searchPhone}`
        );
      }
    } catch (error) {
      console.error('Error searching for Firebase email:', error);
      addTestResult(
        'البحث عن البريد الإلكتروني', 
        false, 
        `خطأ في البحث: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
      );
    } finally {
      setLoadingSearch(false);
    }
  };

  // اختبار البحث عن المستخدم بالبريد الإلكتروني
  const testFindUserByEmail = async () => {
    if (!searchEmail.trim()) {
      addTestResult('البحث عن المستخدم', false, 'يرجى إدخال البريد الإلكتروني');
      return;
    }

    setLoadingSearch(true);
    try {
      console.log('🔍 Searching for user with email:', searchEmail);
      
      // البحث في مجموعة المستخدمين
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', searchEmail));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        console.log('✅ Found user with email:', userData);
        
        setSearchResults({
          uid: userDoc.id,
          ...userData
        });
        
        addTestResult(
          'البحث عن المستخدم', 
          true, 
          `تم العثور على المستخدم بالبريد الإلكتروني ${searchEmail}`,
          {
            phone: userData.phone,
            accountType: userData.accountType,
            full_name: userData.full_name,
            firebaseEmail: userData.firebaseEmail
          }
        );
      } else {
        setSearchResults(null);
        addTestResult(
          'البحث عن المستخدم', 
          false, 
          `لم يتم العثور على مستخدم بالبريد الإلكتروني ${searchEmail}`
        );
      }
    } catch (error) {
      console.error('Error searching for user:', error);
      addTestResult(
        'البحث عن المستخدم', 
        false, 
        `خطأ في البحث: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
      );
    } finally {
      setLoadingSearch(false);
    }
  };

  // اختبار تسجيل الدخول بالبريد الإلكتروني المؤقت
  const testLoginWithFirebaseEmail = async () => {
    if (!searchResults?.firebaseEmail) {
      addTestResult('تسجيل الدخول', false, 'يرجى البحث عن مستخدم أولاً');
      return;
    }

    try {
      addTestResult('تسجيل الدخول', false, 'هذا الاختبار يتطلب كلمة مرور - لا يمكن تنفيذه تلقائياً');
    } catch (error) {
      addTestResult(
        'تسجيل الدخول', 
        false, 
        `خطأ في تسجيل الدخول: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
      );
    }
  };

  // اختبار حالة Firebase
  const testFirebaseStatus = () => {
    try {
      // التحقق من إعدادات Firebase
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
      };

      const hasAllConfig = Object.values(firebaseConfig).every(value => value && value !== 'undefined');
      
      addTestResult(
        'حالة Firebase', 
        hasAllConfig, 
        hasAllConfig ? 'جميع إعدادات Firebase متوفرة' : 'بعض إعدادات Firebase مفقودة',
        firebaseConfig
      );
    } catch (error) {
      addTestResult(
        'حالة Firebase', 
        false, 
        `خطأ في فحص إعدادات Firebase: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
      );
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setSearchResults(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">اختبار نظام تسجيل الدخول Firebase</h1>
        <p className="text-gray-600">اختبار النظام الجديد لتسجيل الدخول برقم الهاتف</p>
      </div>

      {/* حالة المستخدم الحالي */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            حالة المستخدم الحالي
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري التحميل...
            </div>
          ) : user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium">مسجل دخول</span>
              </div>
              <div className="text-sm text-gray-600">
                <p>البريد الإلكتروني: {user.email}</p>
                <p>نوع الحساب: {userData?.accountType || 'غير محدد'}</p>
                <p>الاسم: {userData?.full_name || 'غير محدد'}</p>
                <p>رقم الهاتف: {userData?.phone || 'غير محدد'}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span>غير مسجل دخول</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">البحث</TabsTrigger>
          <TabsTrigger value="tests">الاختبارات</TabsTrigger>
          <TabsTrigger value="results">النتائج</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* البحث برقم الهاتف */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  البحث برقم الهاتف
                </CardTitle>
                <CardDescription>
                  ابحث عن البريد الإلكتروني المؤقت باستخدام رقم الهاتف
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="tel"
                    placeholder="أدخل رقم الهاتف (مثال: 966501234567)"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    maxLength={15}
                  />
                  <Button 
                    onClick={testFindEmailByPhone}
                    disabled={loadingSearch || !searchPhone.trim()}
                    className="w-full"
                  >
                    {loadingSearch ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    البحث
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* البحث بالبريد الإلكتروني */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  البحث بالبريد الإلكتروني
                </CardTitle>
                <CardDescription>
                  ابحث عن المستخدم باستخدام البريد الإلكتروني
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="أدخل البريد الإلكتروني"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                  />
                  <Button 
                    onClick={testFindUserByEmail}
                    disabled={loadingSearch || !searchEmail.trim()}
                    className="w-full"
                  >
                    {loadingSearch ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    البحث
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* نتائج البحث */}
          {searchResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  نتائج البحث
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">UID:</span>
                      <Badge variant="outline" className="mr-2">{searchResults.uid}</Badge>
                    </div>
                    <div>
                      <span className="font-medium">نوع الحساب:</span>
                      <Badge variant="secondary" className="mr-2">{searchResults.accountType}</Badge>
                    </div>
                    <div>
                      <span className="font-medium">الاسم:</span>
                      <span className="mr-2">{searchResults.full_name}</span>
                    </div>
                    <div>
                      <span className="font-medium">رقم الهاتف:</span>
                      <span className="mr-2">{searchResults.phone}</span>
                    </div>
                    <div>
                      <span className="font-medium">البريد الأصلي:</span>
                      <span className="mr-2">{searchResults.originalEmail || 'غير محدد'}</span>
                    </div>
                    <div>
                      <span className="font-medium">بريد Firebase:</span>
                      <span className="mr-2 font-mono text-xs">{searchResults.firebaseEmail || searchResults.email}</span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <Button 
                      onClick={testLoginWithFirebaseEmail}
                      disabled={!searchResults.firebaseEmail}
                      className="w-full"
                    >
                      <Key className="w-4 h-4 mr-2" />
                      اختبار تسجيل الدخول (يتطلب كلمة مرور)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>اختبارات النظام</CardTitle>
              <CardDescription>
                اختبارات مختلفة لفحص عمل النظام
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={testFirebaseStatus} className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  فحص إعدادات Firebase
                </Button>
                <Button onClick={clearResults} variant="outline" className="w-full">
                  مسح النتائج
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>نتائج الاختبارات</CardTitle>
              <CardDescription>
                سجل جميع الاختبارات المنجزة
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-center py-8">لا توجد نتائج اختبارات بعد</p>
              ) : (
                <div className="space-y-3">
                  {testResults.map((result) => (
                    <Alert key={result.id} className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                      <div className="flex items-start gap-2">
                        {result.success ? (
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{result.test}</span>
                            <Badge variant={result.success ? 'default' : 'destructive'} className="text-xs">
                              {result.success ? 'نجح' : 'فشل'}
                            </Badge>
                            <span className="text-xs text-gray-500">{result.timestamp}</span>
                          </div>
                          <AlertDescription className="text-sm">
                            {result.details}
                          </AlertDescription>
                          {result.data && (
                            <details className="mt-2">
                              <summary className="text-xs text-gray-600 cursor-pointer">عرض البيانات التفصيلية</summary>
                              <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* معلومات إضافية */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات النظام</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>كيف يعمل النظام الجديد:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>عند التسجيل، يتم إنشاء بريد إلكتروني مؤقت لـ Firebase إذا لم يتم إدخال بريد صحيح</li>
              <li>البريد المؤقت يأخذ الشكل: user_[رقم_الهاتف]_[timestamp]_[random]@el7hm.local</li>
              <li>عند تسجيل الدخول برقم الهاتف، يتم البحث عن البريد المؤقت في قاعدة البيانات</li>
              <li>يتم تسجيل الدخول باستخدام البريد المؤقت وكلمة المرور</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 