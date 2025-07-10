'use client';

import React, { useState, useEffect } from 'react';
import { EmailService } from '@/lib/emailjs/service';
import { CheckCircle, AlertTriangle, Mail, Settings, Save, TestTube, RefreshCw, Info } from 'lucide-react';

export default function EmailJSSetupPage() {
  const [config, setConfig] = useState({
    publicKey: '',
    serviceId: '',
    templateId: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testName, setTestName] = useState('مستخدم تجريبي');
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = () => {
    const status = EmailService.getConfigurationStatus();
    
    // محاولة تحميل الإعدادات من متغيرات البيئة
    const envConfig = {
      publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '',
      serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
      templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
    };

    // محاولة تحميل الإعدادات من localStorage
    let localConfig = { publicKey: '', serviceId: '', templateId: '' };
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('emailjs_config');
        if (stored) {
          localConfig = JSON.parse(stored);
        }
      } catch (error) {
        console.error('خطأ في تحميل الإعدادات المحلية:', error);
      }
    }

    // دمج الإعدادات (الأولوية لمتغيرات البيئة)
    setConfig({
      publicKey: envConfig.publicKey || localConfig.publicKey,
      serviceId: envConfig.serviceId || localConfig.serviceId,
      templateId: envConfig.templateId || localConfig.templateId,
    });
  };

  const handleSaveConfig = () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      EmailService.updateConfiguration(config);
      setMessage('✅ تم حفظ الإعدادات بنجاح!');
      
      // إعادة تحميل الصفحة بعد ثانيتين
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, 2000);
    } catch (error: any) {
      setError(`❌ خطأ في حفظ الإعدادات: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      setError('يرجى إدخال بريد إلكتروني للاختبار');
      return;
    }

    setLoading(true);
    setError('');
    setTestResult('');

    try {
      const result = await EmailService.sendOTP(testEmail, testName);
      
      if (result.success) {
        setTestResult('✅ تم إرسال بريد الاختبار بنجاح! تحقق من بريدك الإلكتروني.');
      } else {
        setTestResult(`❌ فشل في الإرسال: ${result.message}`);
      }
    } catch (err: any) {
      setTestResult(`❌ خطأ: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetConfig = () => {
    setConfig({
      publicKey: '',
      serviceId: '',
      templateId: '',
    });
    setError('');
    setMessage('');
    setTestResult('');
  };

  const configStatus = EmailService.getConfigurationStatus();
  const isConfigured = EmailService.isConfigured();

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-purple-50" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">إعدادات EmailJS</h1>
          <p className="text-gray-600">إعداد خدمة إرسال البريد الإلكتروني للتحقق من المستخدمين</p>
        </div>

        {/* حالة الإعدادات */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">حالة الإعدادات</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className={`p-4 rounded-lg text-center ${configStatus.publicKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="font-bold mb-2">Public Key</div>
              <div className="text-sm">{configStatus.publicKey ? '✅ متوفر' : '❌ مفقود'}</div>
            </div>
            <div className={`p-4 rounded-lg text-center ${configStatus.serviceId ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="font-bold mb-2">Service ID</div>
              <div className="text-sm">{configStatus.serviceId ? '✅ متوفر' : '❌ مفقود'}</div>
            </div>
            <div className={`p-4 rounded-lg text-center ${configStatus.templateId ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="font-bold mb-2">Template ID</div>
              <div className="text-sm">{configStatus.templateId ? '✅ متوفر' : '❌ مفقود'}</div>
            </div>
          </div>
          
          {isConfigured ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <p className="font-medium">✅ جميع الإعدادات مكتملة! يمكنك الآن استخدام خدمة البريد الإلكتروني.</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <p className="font-medium">❌ بعض الإعدادات مفقودة. يرجى إكمال الإعدادات أدناه.</p>
              </div>
            </div>
          )}
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

        {/* نموذج الإعدادات */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow-lg">
          <h2 className="mb-6 text-xl font-semibold">إعدادات EmailJS</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Public Key:</label>
              <input
                type="text"
                value={config.publicKey}
                onChange={(e) => setConfig({ ...config, publicKey: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل Public Key من EmailJS"
              />
              <p className="mt-1 text-xs text-gray-500">مفتاح API العام من لوحة تحكم EmailJS</p>
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium">Service ID:</label>
              <input
                type="text"
                value={config.serviceId}
                onChange={(e) => setConfig({ ...config, serviceId: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل Service ID"
              />
              <p className="mt-1 text-xs text-gray-500">معرف خدمة البريد الإلكتروني (مثال: service_hagzz)</p>
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium">Template ID:</label>
              <input
                type="text"
                value={config.templateId}
                onChange={(e) => setConfig({ ...config, templateId: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل Template ID"
              />
              <p className="mt-1 text-xs text-gray-500">معرف قالب البريد الإلكتروني (مثال: template_o29zcgp)</p>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSaveConfig}
              disabled={loading || !config.publicKey || !config.serviceId || !config.templateId}
              className="flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </button>
            
            <button
              onClick={handleResetConfig}
              className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              <RefreshCw className="w-5 h-5" />
              إعادة تعيين
            </button>
          </div>
        </div>

        {/* اختبار الإعدادات */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <TestTube className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold">اختبار الإعدادات</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium">البريد الإلكتروني للاختبار:</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل بريد إلكتروني للاختبار"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium">الاسم:</label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل اسم للاختبار"
              />
            </div>
          </div>

          <button
            onClick={handleTestEmail}
            disabled={loading || !isConfigured || !testEmail}
            className="w-full mt-4 py-3 px-4 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Mail className="w-5 h-5" />
            {loading ? 'جاري الإرسال...' : 'إرسال بريد اختبار'}
          </button>

          {testResult && (
            <div className={`mt-4 p-3 rounded-lg ${testResult.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <p>{testResult}</p>
            </div>
          )}
        </div>

        {/* معلومات مساعدة */}
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">معلومات مساعدة</h2>
          </div>
          
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">كيفية الحصول على الإعدادات:</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>اذهب إلى <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">EmailJS.com</a></li>
                <li>سجل دخول أو أنشئ حساب جديد</li>
                <li>اذهب إلى "Email Services" وأنشئ خدمة جديدة</li>
                <li>اذهب إلى "Email Templates" وأنشئ قالب جديد</li>
                <li>انسخ Service ID و Template ID و Public Key</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">متغيرات القالب المطلوبة:</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <code className="text-sm">
                  to_email, to_name, otp_code, expiry_minutes, app_name, support_email
                </code>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">الإعدادات الحالية:</h3>
              <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                <p><strong>Public Key:</strong> {config.publicKey || 'غير محدد'}</p>
                <p><strong>Service ID:</strong> {config.serviceId || 'غير محدد'}</p>
                <p><strong>Template ID:</strong> {config.templateId || 'غير محدد'}</p>
              </div>
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
              اختبار سريع
            </a>
            <a
              href="/auth/register"
              className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50"
            >
              صفحة التسجيل
            </a>
            <a
              href="/test-registration"
              className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50"
            >
              اختبار التسجيل
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 