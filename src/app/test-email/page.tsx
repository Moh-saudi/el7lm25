'use client';

import React, { useState } from 'react';
import { EmailService } from '@/lib/emailjs/service';
import { CheckCircle, AlertTriangle, Mail, Send, RefreshCw, Settings } from 'lucide-react';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('مستخدم تجريبي');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    otp?: string;
  } | null>(null);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setResult({
        success: false,
        message: 'يرجى إدخال بريد إلكتروني صحيح'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await EmailService.sendOTP(email, name);
      setResult(response);
    } catch (error: any) {
      setResult({
        success: false,
        message: `خطأ: ${error.message || 'خطأ غير معروف'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await EmailService.testConnection();
      setResult(response);
    } catch (error: any) {
      setResult({
        success: false,
        message: `خطأ في اختبار الاتصال: ${error.message || 'خطأ غير معروف'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const configStatus = EmailService.getConfigurationStatus();
  const isConfigured = EmailService.isConfigured();

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-purple-50" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">اختبار EmailJS</h1>
          <p className="text-gray-600">اختبار إرسال رسائل OTP عبر البريد الإلكتروني</p>
        </div>

        {/* حالة الإعدادات */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">حالة إعدادات EmailJS</h2>
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
                <p className="font-medium">✅ جميع الإعدادات مكتملة! يمكنك الآن اختبار إرسال البريد الإلكتروني.</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <p className="font-medium">❌ بعض الإعدادات مفقودة. يرجى إكمال الإعدادات في صفحة الإعدادات أولاً.</p>
              </div>
              <div className="mt-4">
                <a 
                  href="/emailjs-setup" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  الذهاب إلى إعدادات EmailJS
                </a>
              </div>
            </div>
          )}
        </div>

        {/* اختبار الاتصال */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow-lg">
          <h2 className="mb-6 text-xl font-semibold">اختبار الاتصال</h2>
          <p className="text-gray-600 mb-4">
            اختبار الاتصال مع EmailJS وإرسال بريد تجريبي
          </p>
          <button
            onClick={handleTestConnection}
            disabled={!isConfigured || loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            اختبار الاتصال
          </button>
        </div>

        {/* نموذج إرسال OTP */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow-lg">
          <h2 className="mb-6 text-xl font-semibold">إرسال OTP تجريبي</h2>
          
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium">البريد الإلكتروني:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل بريدك الإلكتروني"
                required
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium">الاسم:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل اسمك"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={!isConfigured || loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              إرسال OTP
            </button>
          </form>
        </div>

        {/* نتيجة الاختبار */}
        {result && (
          <div className={`p-6 rounded-lg shadow-lg ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <h3 className="font-semibold">
                {result.success ? 'نجح الاختبار' : 'فشل الاختبار'}
              </h3>
            </div>
            <p className="text-sm">{result.message}</p>
            
            {result.success && result.otp && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>رمز التحقق التجريبي:</strong> {result.otp}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  (هذا الرمز يظهر فقط في الاختبار، لن يظهر في الإنتاج)
                </p>
              </div>
            )}
          </div>
        )}

        {/* تعليمات */}
        <div className="p-6 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-3 text-blue-800">تعليمات الاختبار:</h3>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• تأكد من إكمال إعدادات EmailJS أولاً</li>
            <li>• استخدم بريد إلكتروني صحيح لاستلام الرسالة</li>
            <li>• تحقق من مجلد الرسائل غير المرغوب فيها (Spam)</li>
            <li>• في الإنتاج، لن يظهر رمز OTP في النتيجة</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 