'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Phone, 
  Mail, 
  User, 
  Shield,
  Loader2,
  TestTube
} from 'lucide-react';

export default function TestRegistrationFixPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  // اختبار تنسيق البريد الإلكتروني
  const testEmailFormat = () => {
    const testEmails = [
      { email: 'test@example.com', expected: true },
      { email: 'user@domain.co.uk', expected: true },
      { email: 'invalid-email', expected: false },
      { email: 'test@', expected: false },
      { email: '@domain.com', expected: false },
      { email: 'test..test@domain.com', expected: false },
      { email: 'test@domain..com', expected: false },
      { email: 'test@domain', expected: false },
      { email: 'test.domain.com', expected: false }
    ];

    testEmails.forEach(({ email, expected }) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(email);
      const testPassed = isValid === expected;
      
      addTestResult(
        'تنسيق البريد الإلكتروني',
        testPassed,
        `البريد "${email}" ${isValid ? 'صحيح' : 'غير صحيح'} (متوقع: ${expected ? 'صحيح' : 'غير صحيح'})`,
        { email, isValid, expected, testPassed }
      );
    });
  };

  // اختبار إنشاء البريد المؤقت
  const testTemporaryEmailGeneration = () => {
    const testPhones = [
      '966501234567',
      '201234567890',
      '97412345678',
      '971501234567'
    ];

    testPhones.forEach(phone => {
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      let firebaseEmail = `user_${cleanPhone}_${timestamp}_${randomSuffix}@el7hm.local`;
      
      // التأكد من أن البريد لا يتجاوز الحد الأقصى
      if (firebaseEmail.length > 254) {
        firebaseEmail = `user_${cleanPhone.slice(-8)}_${timestamp}_${randomSuffix}@el7hm.local`;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(firebaseEmail);
      const isWithinLimit = firebaseEmail.length <= 254;
      const hasCorrectFormat = firebaseEmail.includes('@el7hm.local') && firebaseEmail.startsWith('user_');

      addTestResult(
        'إنشاء البريد المؤقت',
        isValid && isWithinLimit && hasCorrectFormat,
        `البريد المؤقت لـ ${phone}: ${firebaseEmail}`,
        { 
          phone, 
          firebaseEmail, 
          isValid, 
          isWithinLimit, 
          hasCorrectFormat,
          length: firebaseEmail.length 
        }
      );
    });
  };

  // اختبار التحقق من صحة البريد
  const testEmailValidation = () => {
    const testCases = [
      { email: 'test@example.com', shouldBeValid: true },
      { email: 'user@domain.co.uk', shouldBeValid: true },
      { email: 'user.name@domain.com', shouldBeValid: true },
      { email: 'user+tag@domain.com', shouldBeValid: true },
      { email: 'invalid-email', shouldBeValid: false },
      { email: 'test@', shouldBeValid: false },
      { email: '@domain.com', shouldBeValid: false },
      { email: '', shouldBeValid: false },
      { email: '   ', shouldBeValid: false },
      { email: 'test..test@domain.com', shouldBeValid: false },
      { email: 'test@domain..com', shouldBeValid: false },
      { email: 'test@domain', shouldBeValid: false }
    ];

    testCases.forEach(({ email, shouldBeValid }) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = email.trim() && emailRegex.test(email.trim());
      const matchesExpected = isValid === shouldBeValid;

      addTestResult(
        'التحقق من صحة البريد',
        matchesExpected,
        `البريد "${email}" ${isValid ? 'صحيح' : 'غير صحيح'} (متوقع: ${shouldBeValid ? 'صحيح' : 'غير صحيح'})`,
        { email, isValid, shouldBeValid, matchesExpected }
      );
    });
  };

  // اختبار تنظيف رقم الهاتف
  const testPhoneCleaning = () => {
    const testPhones = [
      { phone: '+966501234567', expected: '966501234567', shouldBeValid: true },
      { phone: '966501234567', expected: '966501234567', shouldBeValid: true },
      { phone: '+20-123-456-7890', expected: '201234567890', shouldBeValid: true },
      { phone: '201234567890', expected: '201234567890', shouldBeValid: true },
      { phone: '+974 1234 5678', expected: '97412345678', shouldBeValid: true },
      { phone: '97412345678', expected: '97412345678', shouldBeValid: true },
      { phone: 'abc123def456ghi789', expected: '123456789', shouldBeValid: true },
      { phone: '123-456-789', expected: '123456789', shouldBeValid: true },
      { phone: '123', expected: '123', shouldBeValid: false }, // قصير جداً
      { phone: '12345678901234567890', expected: '12345678901234567890', shouldBeValid: false } // طويل جداً
    ];

    testPhones.forEach(({ phone, expected, shouldBeValid }) => {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const isValidLength = cleanPhone.length >= 8 && cleanPhone.length <= 15;
      const matchesExpected = cleanPhone === expected;
      const testPassed = isValidLength === shouldBeValid && matchesExpected;
      
      addTestResult(
        'تنظيف رقم الهاتف',
        testPassed,
        `"${phone}" → "${cleanPhone}" (${cleanPhone.length} رقم) ${matchesExpected ? '✓' : '✗'}`,
        { 
          original: phone, 
          cleaned: cleanPhone, 
          expected,
          length: cleanPhone.length, 
          isValidLength,
          matchesExpected,
          shouldBeValid,
          testPassed
        }
      );
    });
  };

  // اختبار regex المستخدم في النظام
  const testSystemRegex = () => {
    const testCases = [
      { email: 'test@example.com', expected: true },
      { email: 'user@domain.co.uk', expected: true },
      { email: 'invalid-email', expected: false },
      { email: 'test@', expected: false },
      { email: '@domain.com', expected: false },
      { email: '', expected: false },
      { email: '   ', expected: false }
    ];

    testCases.forEach(({ email, expected }) => {
      // نفس regex المستخدم في النظام
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = email.trim() && emailRegex.test(email.trim());
      const testPassed = isValid === expected;

      addTestResult(
        'اختبار Regex النظام',
        testPassed,
        `البريد "${email}" ${isValid ? 'صحيح' : 'غير صحيح'} (متوقع: ${expected ? 'صحيح' : 'غير صحيح'})`,
        { email, isValid, expected, testPassed }
      );
    });
  };

  // اختبار شامل
  const runAllTests = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      // تشغيل جميع الاختبارات
      testEmailFormat();
      testTemporaryEmailGeneration();
      testEmailValidation();
      testPhoneCleaning();
      testSystemRegex();

      addTestResult(
        'الاختبار الشامل',
        true,
        'تم تشغيل جميع الاختبارات بنجاح',
        { totalTests: 5 }
      );
    } catch (error) {
      addTestResult(
        'الاختبار الشامل',
        false,
        `خطأ في تشغيل الاختبارات: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`,
        { error }
      );
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getSuccessRate = () => {
    if (testResults.length === 0) return 0;
    const successful = testResults.filter(r => r.success).length;
    return Math.round((successful / testResults.length) * 100);
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">اختبار إصلاح نظام التسجيل</h1>
        <p className="text-gray-600">اختبار التحسينات الجديدة في نظام التسجيل</p>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الاختبارات</p>
                <p className="text-2xl font-bold">{testResults.length}</p>
              </div>
              <TestTube className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">نسبة النجاح</p>
                <p className="text-2xl font-bold">{getSuccessRate()}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الاختبارات الفاشلة</p>
                <p className="text-2xl font-bold">{testResults.filter(r => !r.success).length}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أزرار الاختبار */}
      <Card>
        <CardHeader>
          <CardTitle>اختبارات النظام</CardTitle>
          <CardDescription>
            اختبارات مختلفة لفحص عمل النظام المحدث
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Button onClick={testEmailFormat} variant="outline" className="w-full">
              <Mail className="w-4 h-4 mr-2" />
              تنسيق البريد
            </Button>
            <Button onClick={testTemporaryEmailGeneration} variant="outline" className="w-full">
              <User className="w-4 h-4 mr-2" />
              البريد المؤقت
            </Button>
            <Button onClick={testEmailValidation} variant="outline" className="w-full">
              <Shield className="w-4 h-4 mr-2" />
              التحقق من البريد
            </Button>
            <Button onClick={testPhoneCleaning} variant="outline" className="w-full">
              <Phone className="w-4 h-4 mr-2" />
              تنظيف الهاتف
            </Button>
            <Button onClick={testSystemRegex} variant="outline" className="w-full">
              <TestTube className="w-4 h-4 mr-2" />
              Regex النظام
            </Button>
          </div>
          
          <div className="flex gap-4">
            <Button onClick={runAllTests} disabled={loading} className="flex-1">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <TestTube className="w-4 h-4 mr-2" />
              )}
              تشغيل جميع الاختبارات
            </Button>
            <Button onClick={clearResults} variant="outline">
              مسح النتائج
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* نتائج الاختبارات */}
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

      {/* معلومات إضافية */}
      <Card>
        <CardHeader>
          <CardTitle>التحسينات المطبقة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>التحسينات الجديدة:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>التحقق من صحة تنسيق البريد الإلكتروني قبل فحص وجوده</li>
              <li>تحسين regex للبريد الإلكتروني ليكون أكثر دقة</li>
              <li>إضافة معالجة أفضل للأخطاء في عملية التحقق من البريد</li>
              <li>تحسين إنشاء البريد المؤقت مع التأكد من عدم تجاوز الحد الأقصى</li>
              <li>تنظيف أفضل لأرقام الهاتف قبل إنشاء البريد المؤقت</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 