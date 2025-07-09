'use client';

import React, { useState, useEffect } from 'react';

declare global {
  interface Window {
    GeideaCheckout: any;
  }
}

interface GeideaPaymentModalProps {
  visible: boolean;
  onRequestClose: () => void;
  onPaymentSuccess: (data: any) => void;
  onPaymentFailure: (error: any) => void;
  amount: number;
  currency: string;
  title?: string;
  description?: string;
  callbackUrl?: string;
  returnUrl?: string;
  customerEmail: string;
  merchantReferenceId?: string;
}

interface PaymentModalState {
  loading: boolean;
  error: string | null;
  isTestMode: boolean;
}

export default function GeideaPaymentModal({
  visible,
  onRequestClose,
  onPaymentSuccess,
  onPaymentFailure,
  amount,
  currency,
  title = "الدفع الإلكتروني",
  description = "أكمل عملية الدفع عبر البطاقة الإلكترونية",
  callbackUrl,
  returnUrl,
  customerEmail,
  merchantReferenceId
}: GeideaPaymentModalProps) {
  const [state, setState] = useState<PaymentModalState>({
    loading: false,
    error: null,
    isTestMode: false
  });

  // تعريف callback functions لـ Geidea Checkout
  const onSuccess = (data: any) => {
    console.log('🎉 [Geidea] Payment successful:', data);
    onPaymentSuccess(data);
    onRequestClose();
    // عرض رسالة نجاح (يمكنك استخدام أي مكتبة toast تفضلها)
    alert('تم الدفع بنجاح');
  };

  const onError = (data: any) => {
    console.error('❌ [Geidea] Payment error:', data);
    setState({ loading: false, error: data.detailedResponseMessage || 'حدث خطأ في عملية الدفع', isTestMode: state.isTestMode });
    onPaymentFailure(data);
    // عرض رسالة خطأ
    alert(data.detailedResponseMessage || "حدث خطأ في عملية الدفع");
  };

  const onCancel = (data: any) => {
    console.log('🚫 [Geidea] Payment cancelled:', data);
    onRequestClose();
    // عرض رسالة إلغاء
    alert('تم إلغاء عملية الدفع');
  };

  // تحميل مكتبة Geidea وإنشاء جلسة الدفع عند فتح المودال
  useEffect(() => {
    if (visible) {
      loadGeideaScript()
        .then(() => {
          createPaymentSession();
        })
        .catch((error) => {
          console.error('❌ Failed to load Geidea:', error);
          setState({ 
            loading: false, 
            error: 'فشل في تحميل مكتبة الدفع. يرجى التحقق من الاتصال بالإنترنت وإعادة المحاولة.',
            isTestMode: false 
          });
        });
    }
  }, [visible]);

  // تحميل مكتبة Geidea ديناميكياً
  const loadGeideaScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // التحقق من وجود المكتبة مسبقاً
      if (typeof window !== 'undefined' && window.GeideaCheckout) {
        console.log('✅ Geidea script already loaded');
        resolve();
        return;
      }

      // التحقق من وجود script tag مسبقاً
      const existingScript = document.querySelector('script[src*="geideaCheckout.min.js"]');
      if (existingScript) {
        console.log('✅ Geidea script tag exists, waiting for load...');
        // إذا كان الـ script موجود ولكن المكتبة غير متاحة، انتظر قليلاً
        const checkInterval = setInterval(() => {
          if (window.GeideaCheckout) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        
        // timeout بعد 10 ثوانٍ
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error('Timeout waiting for Geidea script'));
        }, 10000);
        return;
      }

      // إنشاء script tag وتحميل المكتبة
      console.log('📥 Loading Geidea script dynamically...');
      const script = document.createElement('script');
      script.src = 'https://www.merchant.geidea.net/hpp/geideaCheckout.min.js';
      script.async = true;
      script.id = 'geidea-checkout-dynamic';
      
      script.onload = () => {
        console.log('✅ Geidea script loaded successfully');
        resolve();
      };
      
      script.onerror = (error) => {
        console.error('❌ Failed to load Geidea script:', error);
        // إزالة الـ script الفاشل
        script.remove();
        reject(new Error('Failed to load Geidea payment library'));
      };

      document.head.appendChild(script);
    });
  };

  const createPaymentSession = async () => {
    setState({ loading: true, error: null, isTestMode: false });

    try {
      const orderId = merchantReferenceId || `EL7HM_${Date.now()}`;
      const payload = {
        amount: amount,
        currency: currency,
        orderId: orderId,
        customerEmail: customerEmail,
        customerName: 'Customer'
      };
      console.log('🚀 [Geidea] Sending payment payload:', payload);
      
      const response = await fetch('/api/geidea/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('🌍 [Geidea] API response:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.details || 'فشل في إنشاء جلسة الدفع');
      }

      // التحقق من وضع الاختبار (إذا كان مفعل)
      if (data.isTestMode) {
        setState({ loading: false, error: null, isTestMode: true });
        console.log('🧪 [Geidea] Test mode detected');
        
        // في وضع الاختبار، نعرض رسالة للمستخدم
        alert('وضع الاختبار: تم إنشاء جلسة دفع تجريبية. في الإنتاج، سيتم توجيهك لصفحة الدفع الفعلية.');
        
        // محاكاة نجاح الدفع بعد ثانيتين
        setTimeout(() => {
          onPaymentSuccess({
            sessionId: data.sessionId,
            orderId: data.merchantReferenceId,
            isTestMode: true
          });
        }, 2000);
        
        return;
      }

      // ✅ وضع الإنتاج الحقيقي - توجيه لجيديا
      console.log('💳 [Geidea] Live mode - redirecting to payment gateway');
      setState({ loading: false, error: null, isTestMode: false });

      // إنشاء كائن GeideaCheckout وبدء عملية الدفع
      if (typeof window !== 'undefined' && window.GeideaCheckout) {
        console.log('🚀 Initializing Geidea Checkout...');
        const payment = new window.GeideaCheckout(onSuccess, onError, onCancel);
        payment.startPayment(data.sessionId);
        
        // إغلاق المودال لأن Geidea ستفتح المودال الخاص بها
        onRequestClose();
      } else {
        console.error('❌ Geidea Checkout SDK not available');
        throw new Error('مكتبة الدفع غير متاحة. يرجى إعادة المحاولة.');
      }

    } catch (error) {
      console.error('❌ [Geidea] Error creating payment session:', error);
      setState({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
        isTestMode: false
      });
      onPaymentFailure({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-sm text-gray-600">{description}</p>
        </div>

        {/* Content */}
        <div className="text-center">
          {state.loading ? (
            <div>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 mb-4">جاري تجهيز صفحة الدفع...</p>
              <p className="text-xs text-gray-500">سيتم توجيهك لصفحة الدفع الآمنة خلال لحظات</p>
            </div>
          ) : state.error ? (
            <div>
              <div className="text-red-500 text-6xl mb-4">❌</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">خطأ في الدفع</h3>
              <p className="text-gray-600 mb-4 text-sm">{state.error}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={createPaymentSession}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  إعادة المحاولة
                </button>
                <button
                  onClick={onRequestClose}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          ) : state.isTestMode ? (
            <div>
              <div className="text-yellow-500 text-6xl mb-4">🧪</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">وضع الاختبار</h3>
              <p className="text-gray-600 mb-4 text-sm">تم إنشاء جلسة دفع تجريبية. في الإنتاج، سيتم توجيهك لصفحة الدفع الفعلية.</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  💡 <strong>ملاحظة:</strong> هذا وضع اختبار. لإعداد الدفع الفعلي، أضف بيانات Geidea في ملف .env.local
                </p>
              </div>
              <button
                onClick={onRequestClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                إغلاق
              </button>
            </div>
          ) : (
            <div>
              <div className="text-green-500 text-6xl mb-4">💳</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🚀 جاري توجيهك للدفع</h3>
              <p className="text-gray-600 mb-4 text-sm">سيتم فتح نافذة دفع جيديا الآمنة خلال لحظات...</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  🔒 <strong>دفع آمن:</strong> ستنتقل لبوابة جيديا الرسمية لإدخال بيانات البطاقة بأمان تام
                </p>
              </div>
              <div className="animate-pulse">
                <div className="w-12 h-12 bg-green-100 rounded-full mx-auto mb-4"></div>
              </div>
              <p className="text-gray-600">جاري تحضير صفحة الدفع...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span>🔒</span>
              <span>مدفوعات آمنة</span>
            </div>
            <div className="flex items-center gap-1">
              <span>💳</span>
              <span>بطاقات ائتمان ومدى</span>
            </div>
          </div>
        </div>

        {/* Close button */}
        {!state.loading && (
          <button
            onClick={onRequestClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
} 
