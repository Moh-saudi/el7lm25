'use client';

import { useState } from 'react';

export default function TestWhatsAppCompletePage() {
  const [phoneNumber, setPhoneNumber] = useState('+966501234567');
  const [name, setName] = useState('أحمد محمد');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState('');

  const addResult = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setResults(prev => [...prev, { 
      id: Date.now(), 
      message, 
      type, 
      timestamp: new Date().toLocaleTimeString('ar-SA') 
    }]);
  };

  const clearResults = () => {
    setResults([]);
    setError('');
  };

  // اختبار التكوين الأساسي
  const testConfiguration = async () => {
    addResult('🔧 فحص تكوين WhatsApp...', 'info');
    
    const config = {
      businessToken: process.env.WHATSAPP_ACCESS_TOKEN ? '✅ Set' : '❌ Missing',
      businessPhoneId: process.env.WHATSAPP_PHONE_ID ? '✅ Set' : '❌ Missing',
      greenApiToken: process.env.GREEN_API_TOKEN ? '✅ Set' : '❌ Missing',
      greenApiInstance: process.env.GREEN_API_INSTANCE ? '✅ Set' : '❌ Missing',
    };

    addResult(`📱 WhatsApp Business Token: ${config.businessToken}`, 'info');
    addResult(`📱 WhatsApp Phone ID: ${config.businessPhoneId}`, 'info');
    addResult(`📱 Green API Token: ${config.greenApiToken}`, 'info');
    addResult(`📱 Green API Instance: ${config.greenApiInstance}`, 'info');

    const hasBusinessConfig = config.businessToken === '✅ Set' && config.businessPhoneId === '✅ Set';
    const hasGreenConfig = config.greenApiToken === '✅ Set' && config.greenApiInstance === '✅ Set';

    if (hasBusinessConfig) {
      addResult('✅ تكوين WhatsApp Business API صحيح', 'success');
    } else {
      addResult('❌ تكوين WhatsApp Business API غير مكتمل', 'error');
    }

    if (hasGreenConfig) {
      addResult('✅ تكوين Green API صحيح', 'success');
    } else {
      addResult('❌ تكوين Green API غير مكتمل', 'error');
    }

    if (!hasBusinessConfig && !hasGreenConfig) {
      addResult('❌ لا يوجد تكوين صحيح للواتساب', 'error');
    }
  };

  // اختبار إرسال OTP عبر WhatsApp Business API
  const testWhatsAppBusinessOTP = async () => {
    setLoading(true);
    addResult('📱 اختبار إرسال OTP عبر WhatsApp Business API...', 'info');
    
    try {
      const response = await fetch('/api/whatsapp/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          name,
          serviceType: 'business'
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        addResult('✅ تم إرسال OTP عبر WhatsApp Business API بنجاح', 'success');
        addResult(`📞 الرقم: ${data.phoneNumber}`, 'info');
        addResult(`🔢 طول OTP: ${data.otpLength}`, 'info');
      } else {
        addResult(`❌ فشل في إرسال OTP عبر WhatsApp Business API: ${data.error}`, 'error');
      }
    } catch (error: any) {
      addResult(`❌ خطأ في اختبار WhatsApp Business API: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // اختبار إرسال OTP عبر Green API
  const testWhatsAppGreenOTP = async () => {
    setLoading(true);
    addResult('📱 اختبار إرسال OTP عبر Green API...', 'info');
    
    try {
      const response = await fetch('/api/whatsapp/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          name,
          serviceType: 'green'
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        addResult('✅ تم إرسال OTP عبر Green API بنجاح', 'success');
        addResult(`📞 الرقم: ${data.phoneNumber}`, 'info');
        addResult(`🔢 طول OTP: ${data.otpLength}`, 'info');
      } else {
        addResult(`❌ فشل في إرسال OTP عبر Green API: ${data.error}`, 'error');
      }
    } catch (error: any) {
      addResult(`❌ خطأ في اختبار Green API: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // اختبار BeOn WhatsApp
  const testBeOnWhatsApp = async () => {
    setLoading(true);
    addResult('📱 اختبار إرسال OTP عبر BeOn WhatsApp...', 'info');
    
    try {
      const response = await fetch('/api/notifications/whatsapp/beon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          name
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        addResult('✅ تم إرسال OTP عبر BeOn بنجاح', 'success');
        addResult(`📞 الرقم: ${data.phoneNumber}`, 'info');
        addResult(`🔢 OTP المرسل: ${data.otp}`, 'info');
        if (data.link) {
          addResult(`🔗 رابط WhatsApp: ${data.link}`, 'info');
        }
        if (data.fallback) {
          addResult('📱 تم استخدام SMS كبديل', 'info');
        }
      } else {
        addResult(`❌ فشل في إرسال OTP عبر BeOn: ${data.error}`, 'error');
      }
    } catch (error: any) {
      addResult(`❌ خطأ في اختبار BeOn: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // اختبار BeOn SMS
  const testBeOnSMS = async () => {
    setLoading(true);
    addResult('📱 اختبار إرسال OTP عبر BeOn SMS...', 'info');
    
    try {
      const response = await fetch('/api/notifications/whatsapp/beon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          name,
          type: 'sms'
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        addResult('✅ تم إرسال OTP عبر BeOn SMS بنجاح', 'success');
        addResult(`📞 الرقم: ${data.phoneNumber}`, 'info');
        addResult(`🔢 OTP المرسل: ${data.otp}`, 'info');
      } else {
        addResult(`❌ فشل في إرسال OTP عبر BeOn SMS: ${data.error}`, 'error');
      }
    } catch (error: any) {
      addResult(`❌ خطأ في اختبار BeOn SMS: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // اختبار API مباشر للواتساب
  const testDirectWhatsAppAPI = async () => {
    setLoading(true);
    addResult('📱 اختبار API مباشر للواتساب...', 'info');
    
    try {
      const response = await fetch('/api/notifications/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          message: 'اختبار رسالة WhatsApp من El7hm',
          type: 'business'
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        addResult('✅ تم إرسال رسالة WhatsApp مباشرة بنجاح', 'success');
        addResult(`📞 الرقم: ${phoneNumber}`, 'info');
        addResult(`🆔 معرف الرسالة: ${data.messageId}`, 'info');
      } else {
        addResult(`❌ فشل في إرسال رسالة WhatsApp مباشرة: ${data.error}`, 'error');
      }
    } catch (error: any) {
      addResult(`❌ خطأ في اختبار API المباشر: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // اختبار شامل
  const runCompleteTest = async () => {
    clearResults();
    addResult('🚀 بدء الاختبار الشامل للواتساب...', 'info');
    
    // اختبار التكوين
    await testConfiguration();
    
    // انتظار قليلاً
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // اختبار BeOn WhatsApp أولاً (الأكثر احتمالاً للعمل)
    await testBeOnWhatsApp();
    
    // انتظار قليلاً
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // اختبار BeOn SMS
    await testBeOnSMS();
    
    // انتظار قليلاً
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // اختبار WhatsApp Business API
    await testWhatsAppBusinessOTP();
    
    // انتظار قليلاً
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // اختبار Green API
    await testWhatsAppGreenOTP();
    
    // انتظار قليلاً
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // اختبار API المباشر
    await testDirectWhatsAppAPI();
    
    addResult('🏁 انتهى الاختبار الشامل', 'info');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            اختبار شامل لـ WhatsApp OTP
          </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف
            </label>
            <input
              type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+966501234567"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أحمد محمد"
            />
          </div>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <button
              onClick={testConfiguration}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              🔧 فحص التكوين
            </button>
            
            <button
              onClick={testBeOnWhatsApp}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              📱 اختبار BeOn WhatsApp
            </button>
            
            <button
              onClick={testBeOnSMS}
              disabled={loading}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              📱 اختبار BeOn SMS
            </button>
            
            <button
              onClick={testWhatsAppBusinessOTP}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              📱 اختبار WhatsApp Business
            </button>
            
          <button
              onClick={testWhatsAppGreenOTP}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
          >
              📱 اختبار Green API
          </button>
          
          <button
              onClick={testDirectWhatsAppAPI}
            disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
              📱 اختبار API المباشر
          </button>
          
          <button
              onClick={runCompleteTest}
            disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
              🚀 اختبار شامل
          </button>
        </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              نتائج الاختبار
            </h2>
            <button
              onClick={clearResults}
              className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
            >
              مسح النتائج
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-gray-500 text-center">لا توجد نتائج بعد. ابدأ الاختبار!</p>
            ) : (
              <div className="space-y-2">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className={`p-3 rounded-md ${
                      result.type === 'success' ? 'bg-green-100 text-green-800' :
                      result.type === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm">{result.message}</span>
                      <span className="text-xs text-gray-500 mr-2">{result.timestamp}</span>
                    </div>
                  </div>
                ))}
          </div>
        )}
          </div>

          {loading && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-md">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 mr-2"></div>
                جاري الاختبار...
              </div>
          </div>
        )}

          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md">
              <strong>خطأ:</strong> {error}
        </div>
          )}
        </div>
      </div>
    </div>
  );
} 