'use client';

import { useState } from 'react';
import { Phone, Send, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import SMSOTPVerification from '@/components/shared/SMSOTPVerification';

export default function TestSMSOTPPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [testResults, setTestResults] = useState<any>({});

  const handleSendOTP = async () => {
    // منع الإرسال المتكرر
    if (loading) {
      console.log('🛑 SMS OTP sending blocked - already loading');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    setTestResults({});

    try {
      const response = await fetch('/api/sms/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          name,
          useTemplate: false // استخدام SMS عادي للاختبار
        })
      });

      const result = await response.json();

      if (result.success) {
        setMessage('تم إرسال رمز التحقق بنجاح!');
        setShowOTP(true);
        setTestResults(prev => ({
          ...prev,
          sendOTP: { success: true, message: result.message }
        }));
      } else {
        setError(result.error || 'فشل في إرسال رمز التحقق');
        setTestResults(prev => ({
          ...prev,
          sendOTP: { success: false, error: result.error }
        }));
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      setError('حدث خطأ في الاتصال');
      setTestResults(prev => ({
        ...prev,
        sendOTP: { success: false, error: error.message }
      }));
    }

    setLoading(false);
  };

  const handleOTPSuccess = (otp: string) => {
    setMessage('تم التحقق من رقم الهاتف بنجاح!');
    setTestResults(prev => ({
      ...prev,
      verifyOTP: { success: true, otp }
    }));
    setShowOTP(false);
  };

  const handleOTPFailed = (error: string) => {
    setError(`فشل في التحقق: ${error}`);
    setTestResults(prev => ({
      ...prev,
      verifyOTP: { success: false, error }
    }));
  };

  const handleOTPClose = () => {
    setShowOTP(false);
    setMessage('تم إلغاء التحقق من رقم الهاتف');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">اختبار SMS OTP</h1>
          </div>
          <p className="text-gray-600">
            اختبار نظام إرسال رمز التحقق عبر SMS باستخدام BeOn API
          </p>
        </div>

        {/* Test Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">إرسال رمز التحقق</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل اسمك"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+201234567890"
              />
              <p className="text-xs text-gray-500 mt-1">
                تأكد من إدخال رقم الهاتف مع رمز الدولة (مثال: +201234567890)
              </p>
            </div>

            <button
              onClick={handleSendOTP}
              disabled={loading || !phoneNumber.trim() || !name.trim()}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  إرسال رمز التحقق
                </>
              )}
            </button>
          </div>

          {/* Messages */}
          {message && (
            <div className="flex items-center gap-2 p-3 mt-4 text-green-700 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <p className="text-sm">{message}</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 mt-4 text-red-700 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">نتائج الاختبار</h2>
            
            <div className="space-y-3">
              {Object.entries(testResults).map(([test, result]: [string, any]) => (
                <div key={test} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      {test === 'sendOTP' && 'إرسال OTP'}
                      {test === 'verifyOTP' && 'التحقق من OTP'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {result.success ? (
                      <span className="text-green-600">
                        ✅ نجح الاختبار
                        {result.otp && ` - OTP: ${result.otp}`}
                      </span>
                    ) : (
                      <span className="text-red-600">❌ فشل الاختبار: {result.error}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">تعليمات الاختبار:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• أدخل اسمك ورقم هاتفك الصحيح مع رمز الدولة</li>
            <li>• اضغط على "إرسال رمز التحقق"</li>
            <li>• ستظهر نافذة لإدخال الرمز المستلم</li>
            <li>• أدخل الرمز المكون من 6 أرقام</li>
            <li>• تأكد من أن هاتفك متصل بالإنترنت</li>
          </ul>
        </div>
      </div>

      {/* SMS OTP Modal */}
      <SMSOTPVerification
        phoneNumber={phoneNumber}
        name={name}
        isOpen={showOTP}
        onVerificationSuccess={handleOTPSuccess}
        onVerificationFailed={handleOTPFailed}
        onClose={handleOTPClose}
        title="التحقق من رقم الهاتف"
        subtitle="تم إرسال رمز التحقق إلى هاتفك"
        otpExpirySeconds={30}
        useTemplate={false}
      />
    </div>
  );
} 