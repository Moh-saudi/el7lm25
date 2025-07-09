'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TestForgotPasswordCompletePage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('السعودية');
  const [phoneNumber, setPhoneNumber] = useState('501234567');

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testForgotPasswordPage = async () => {
    addTestResult('🧪 اختبار الوصول لصفحة نسيت كلمة المرور...');
    
    try {
      const response = await fetch('/auth/forgot-password');
      if (response.ok) {
        addTestResult('✅ صفحة نسيت كلمة المرور متاحة');
      } else {
        addTestResult(`❌ خطأ في الوصول للصفحة: ${response.status}`);
      }
    } catch (error: any) {
      addTestResult(`❌ خطأ في اختبار الصفحة: ${error.message}`);
    }
  };

  const testWhatsAppConfig = async () => {
    addTestResult('🔧 اختبار تكوين WhatsApp...');
    
    try {
      const response = await fetch('/api/whatsapp/test-config');
      const data = await response.json();
      
      if (data.success) {
        addTestResult(`✅ تكوين WhatsApp صحيح (${data.defaultType})`);
        addTestResult(`📱 Business API: ${data.config.business.valid ? '✅' : '❌'}`);
        addTestResult(`💬 Green API: ${data.config.green.valid ? '✅' : '❌'}`);
      } else {
        addTestResult('❌ تكوين WhatsApp غير صحيح');
        data.recommendations?.forEach((rec: string) => {
          addTestResult(`💡 ${rec}`);
        });
      }
    } catch (error: any) {
      addTestResult(`❌ خطأ في اختبار التكوين: ${error.message}`);
    }
  };

  const testWhatsAppOTP = async () => {
    const fullPhone = selectedCountry === 'السعودية' ? '+966' + phoneNumber : '+20' + phoneNumber;
    addTestResult(`📱 اختبار إرسال WhatsApp OTP لـ ${fullPhone}...`);
    
    try {
      const response = await fetch('/api/whatsapp/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: fullPhone,
          name: 'مستخدم اختبار',
          serviceType: 'business'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        addTestResult('✅ تم إرسال WhatsApp OTP بنجاح');
        addTestResult(`🔢 الرمز المرسل: ${data.otp}`);
      } else {
        addTestResult(`❌ فشل في إرسال WhatsApp OTP: ${data.error}`);
      }
    } catch (error: any) {
      addTestResult(`❌ خطأ في اختبار WhatsApp: ${error.message}`);
    }
  };

  const testSMSOTP = async () => {
    const fullPhone = selectedCountry === 'السعودية' ? '+966' + phoneNumber : '+20' + phoneNumber;
    addTestResult(`📱 اختبار إرسال SMS OTP لـ ${fullPhone}...`);
    
    try {
      const response = await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: fullPhone,
          message: 'رمز التحقق: 123456 - El7hm',
          type: 'otp'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        addTestResult('✅ تم إرسال SMS OTP بنجاح');
      } else {
        addTestResult(`❌ فشل في إرسال SMS OTP: ${data.error}`);
      }
    } catch (error: any) {
      addTestResult(`❌ خطأ في اختبار SMS: ${error.message}`);
    }
  };

  const testResetPasswordAPI = async () => {
    const fullPhone = selectedCountry === 'السعودية' ? '+966' + phoneNumber : '+20' + phoneNumber;
    addTestResult(`🔐 اختبار API إعادة تعيين كلمة المرور لـ ${fullPhone}...`);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: fullPhone,
          newPassword: 'testpassword123'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        addTestResult('✅ API إعادة تعيين كلمة المرور يعمل');
        addTestResult(`📝 الرسالة: ${data.message}`);
      } else {
        addTestResult(`❌ خطأ في API: ${data.error}`);
      }
    } catch (error: any) {
      addTestResult(`❌ خطأ في اختبار API: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    addTestResult('🚀 بدء جميع الاختبارات...');
    
    await testForgotPasswordPage();
    await testWhatsAppConfig();
    await testWhatsAppOTP();
    await testSMSOTP();
    await testResetPasswordAPI();
    
    addTestResult('✅ انتهت جميع الاختبارات');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            اختبار شامل لصفحة نسيت كلمة المرور
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">إعدادات الاختبار</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الدولة</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="السعودية">السعودية (+966)</option>
                  <option value="مصر">مصر (+20)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="501234567"
                />
                <p className="text-xs text-gray-500 mt-1">
                  الرقم الكامل: {selectedCountry === 'السعودية' ? '+966' + phoneNumber : '+20' + phoneNumber}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">الاختبارات</h2>
              
              <button
                onClick={runAllTests}
                className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                تشغيل جميع الاختبارات
              </button>
              
              <button
                onClick={testForgotPasswordPage}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                اختبار صفحة نسيت كلمة المرور
              </button>
              
              <button
                onClick={testWhatsAppConfig}
                className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                اختبار تكوين WhatsApp
              </button>
              
              <button
                onClick={testWhatsAppOTP}
                className="w-full py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                اختبار إرسال WhatsApp OTP
              </button>
              
              <button
                onClick={testSMSOTP}
                className="w-full py-2 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                اختبار إرسال SMS OTP
              </button>
              
              <button
                onClick={testResetPasswordAPI}
                className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Link
              href="/auth/forgot-password"
              className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              <h3 className="font-medium text-blue-800">صفحة نسيت كلمة المرور</h3>
              <p className="text-sm text-blue-600">اختبار الواجهة</p>
            </Link>
            
            <Link
              href="/test-whatsapp"
              className="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-center"
            >
              <h3 className="font-medium text-green-800">اختبار WhatsApp</h3>
              <p className="text-sm text-green-600">اختبار منفصل</p>
            </Link>
            
            <Link
              href="/auth/login"
              className="block p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-center"
            >
              <h3 className="font-medium text-purple-800">صفحة تسجيل الدخول</h3>
              <p className="text-sm text-purple-600">رابط نسيت كلمة المرور</p>
            </Link>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">نتائج الاختبار</h2>
            
            {testResults.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-center">
                لا توجد نتائج اختبار بعد. اضغط على "تشغيل جميع الاختبارات" لبدء الاختبار.
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
                        : result.includes('💡')
                        ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
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
            <h3 className="text-sm font-medium text-blue-800 mb-2">معلومات مهمة:</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• تأكد من أن متغيرات البيئة لـ WhatsApp مضبوطة بشكل صحيح</li>
              <li>• WHATSAPP_ACCESS_TOKEN و WHATSAPP_PHONE_ID مطلوبان</li>
              <li>• مصر تستخدم SMS، باقي الدول تستخدم WhatsApp</li>
              <li>• في حالة فشل WhatsApp، سيتم تجربة SMS تلقائياً</li>
              <li>• تأكد من أن رقم الهاتف مسجل في WhatsApp للدول غير المصرية</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 