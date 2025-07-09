'use client';

import { useState } from 'react';
import { createGeideaSession, generateOrderId, formatAmount, validateEmail, validateAmount } from '@/lib/geidea-client';
import { useAuth } from '@/lib/firebase/auth-provider';
import { CreditCard, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function TestPaymentPage() {
  const { user } = useAuth();
  const [amount, setAmount] = useState('100');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handlePayment = async () => {
    if (!user) {
      alert('يجب تسجيل الدخول أولاً');
      return;
    }

    const amountNum = parseFloat(amount);
    if (!validateAmount(amountNum)) {
      alert('المبلغ غير صحيح. يجب أن يكون بين 1 و 100,000');
      return;
    }

    if (!validateEmail(email)) {
      alert('البريد الإلكتروني غير صحيح');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const orderId = generateOrderId();
      const sessionData = {
        amount: amountNum,
        currency: 'EGP',
        orderId: orderId,
        customerEmail: email,
        customerName: user.displayName || 'Customer'
      };

      console.log('Creating payment session:', sessionData);

      const response = await createGeideaSession(sessionData);

      console.log('Geidea response:', response);

      if (response.success && response.redirectUrl) {
        setResult({
          type: 'success',
          message: 'تم إنشاء جلسة الدفع بنجاح! جاري التوجيه...',
          redirectUrl: response.redirectUrl,
          sessionId: response.sessionId,
          orderId: response.orderId
        });

        // توجيه المستخدم لصفحة الدفع بعد ثانيتين
        setTimeout(() => {
          window.location.href = response.redirectUrl!;
        }, 2000);

      } else {
        setResult({
          type: 'error',
          message: response.error || 'فشل في إنشاء جلسة الدفع',
          details: response.details
        });
      }

    } catch (error) {
      console.error('Payment error:', error);
      setResult({
        type: 'error',
        message: 'حدث خطأ غير متوقع',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* العنوان */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              اختبار الدفع مع Geidea
            </h1>
            <p className="text-gray-600">
              اختبر تكامل بوابة الدفع الإلكتروني
            </p>
          </div>

          {/* نموذج الدفع */}
          <div className="space-y-6">
            {/* المبلغ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المبلغ (جنيه مصري)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل المبلغ"
                min="1"
                max="100000"
              />
              <p className="text-sm text-gray-500 mt-1">
                المبلغ المطلوب: {formatAmount(parseFloat(amount) || 0)}
              </p>
            </div>

            {/* البريد الإلكتروني */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل بريدك الإلكتروني"
              />
            </div>

            {/* زر الدفع */}
            <button
              onClick={handlePayment}
              disabled={loading || !user}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  جاري إنشاء جلسة الدفع...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  ادفع الآن
                </>
              )}
            </button>

            {/* رسالة للمستخدمين غير المسجلين */}
            {!user && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <p className="text-yellow-800 text-sm">
                    يجب تسجيل الدخول أولاً لاختبار الدفع
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* نتيجة العملية */}
          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              result.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center mb-2">
                {result.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                )}
                <span className={`font-medium ${
                  result.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.message}
                </span>
              </div>
              
              {result.details && (
                <p className={`text-sm ${
                  result.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.details}
                </p>
              )}

              {result.type === 'success' && result.sessionId && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-green-600">
                    <strong>Session ID:</strong> {result.sessionId}
                  </p>
                  <p className="text-xs text-green-600">
                    <strong>Order ID:</strong> {result.orderId}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* معلومات إضافية */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">معلومات مهمة:</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• هذا اختبار لبوابة الدفع الإلكتروني Geidea</li>
              <li>• سيتم توجيهك لصفحة الدفع الرسمية</li>
              <li>• يمكنك استخدام بيانات اختبار للبطاقة</li>
              <li>• لن يتم خصم أي مبلغ حقيقي</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 
