'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PaymentData {
  orderId?: string;
  reference?: string;
  responseCode?: string;
  responseMessage?: string;
  status?: string;
  amount?: number;
  currency?: string;
  sessionId?: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // استخراج بيانات الدفع من URL parameters
    const orderId = searchParams.get('orderId');
    const reference = searchParams.get('reference');
    const responseCode = searchParams.get('responseCode');
    const responseMessage = searchParams.get('responseMessage');
    const status = searchParams.get('status');
    const sessionId = searchParams.get('sessionId');

    console.log('🔍 [Payment Success] URL Parameters:', {
      orderId,
      reference,
      responseCode,
      responseMessage,
      status,
      sessionId
    });

    // التحقق من بيانات الدفع المحفوظة في localStorage
    try {
      const savedPayments = JSON.parse(localStorage.getItem('geidea_payments') || '[]');
      const latestPayment = savedPayments[savedPayments.length - 1];
      
      if (latestPayment) {
        setPaymentData({
          orderId: orderId || latestPayment.orderId,
          reference: reference || latestPayment.reference,
          responseCode: responseCode || latestPayment.responseCode,
          responseMessage: responseMessage || latestPayment.responseMessage,
          status: status || latestPayment.status,
          amount: latestPayment.amount,
          currency: latestPayment.currency,
          sessionId: sessionId || latestPayment.sessionId
        });
      } else {
        // استخدام البيانات من URL إذا لم تكن موجودة في localStorage
        setPaymentData({
          orderId,
          reference,
          responseCode,
          responseMessage,
          status,
          sessionId
        });
      }
    } catch (error) {
      console.error('❌ [Payment Success] Error reading payment data:', error);
      setPaymentData({
        orderId,
        reference,
        responseCode,
        responseMessage,
        status,
        sessionId
      });
    }

    setLoading(false);
  }, [searchParams]);

  // تحديد حالة الدفع
  const isSuccess = paymentData.responseCode === '000' && paymentData.responseMessage === 'Success';
  const isProcessing = paymentData.responseCode === '210' || paymentData.responseCode === '999';
  const isFailed = paymentData.responseCode && paymentData.responseCode !== '000' && paymentData.responseCode !== '999';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من حالة الدفع...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {isSuccess ? (
          // صفحة النجاح
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">تم الدفع بنجاح!</h1>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="text-sm text-green-800">
                <p className="mb-2">
                  <strong>المبلغ:</strong> {paymentData.amount} {paymentData.currency}
                </p>
                <p className="mb-2">
                  <strong>رمز الطلب:</strong> {paymentData.orderId}
                </p>
                <p className="mb-2">
                  <strong>المرجع:</strong> {paymentData.reference}
                </p>
                <p>
                  <strong>الحالة:</strong> {paymentData.responseMessage}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-gray-600 text-sm">
                تم إرسال تأكيد الدفع إلى بريدك الإلكتروني
              </p>
              
              <div className="flex flex-col gap-3">
                <Link
                  href="/dashboard"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  العودة للوحة التحكم
                </Link>
                
                <Link
                  href="/dashboard/payment"
                  className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  صفحة المدفوعات
                </Link>
              </div>
            </div>
          </div>
        ) : isProcessing ? (
          // صفحة المعالجة
          <div className="text-center">
            <div className="text-yellow-500 text-6xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">جاري معالجة الدفع</h1>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="text-sm text-yellow-800">
                <p className="mb-2">
                  <strong>رمز الاستجابة:</strong> {paymentData.responseCode}
                </p>
                <p className="mb-2">
                  <strong>الرسالة:</strong> {paymentData.responseMessage}
                </p>
                {paymentData.sessionId && (
                  <p className="mb-2">
                    <strong>معرف الجلسة:</strong> {paymentData.sessionId}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-gray-600 text-sm">
                يرجى الانتظار قليلاً، قد يستغرق الدفع بعض الوقت للظهور
              </p>
              
              <div className="flex flex-col gap-3">
                <Link
                  href="/dashboard/payment"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  المحاولة مرة أخرى
                </Link>
                
                <Link
                  href="/dashboard"
                  className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  العودة للوحة التحكم
                </Link>
              </div>
            </div>
          </div>
        ) : (
          // صفحة الفشل
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">فشل في عملية الدفع</h1>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-sm text-red-800">
                <p className="mb-2">
                  <strong>رمز الخطأ:</strong> {paymentData.responseCode}
                </p>
                <p className="mb-2">
                  <strong>الرسالة:</strong> {paymentData.responseMessage}
                </p>
                {paymentData.orderId && (
                  <p className="mb-2">
                    <strong>رمز الطلب:</strong> {paymentData.orderId}
                  </p>
                )}
                {paymentData.reference && (
                  <p className="mb-2">
                    <strong>المرجع:</strong> {paymentData.reference}
                  </p>
                )}
                {paymentData.sessionId && (
                  <p>
                    <strong>معرف الجلسة:</strong> {paymentData.sessionId}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-gray-600 text-sm">
                يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني
              </p>
              
              <div className="flex flex-col gap-3">
                <Link
                  href="/dashboard/payment"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  المحاولة مرة أخرى
                </Link>
                
                <Link
                  href="/dashboard"
                  className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  العودة للوحة التحكم
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* معلومات إضافية للتطوير */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">معلومات التطوير:</h3>
            <pre className="text-xs text-gray-600 overflow-auto">
              {JSON.stringify(paymentData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// مكون التحميل
function PaymentSuccessLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">جاري تحميل صفحة الدفع...</p>
      </div>
    </div>
  );
}

// المكون الرئيسي مع Suspense
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessLoading />}>
      <PaymentSuccessContent />
    </Suspense>
  );
} 