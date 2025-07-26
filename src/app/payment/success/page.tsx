'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useTranslation } from '@/lib/translations/simple-context';

export default function PaymentSuccessPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const orderId = searchParams.get('orderId');
        const reference = searchParams.get('reference');
        const merchantReferenceId = searchParams.get('merchantReferenceId');

        if (merchantReferenceId) {
          const paymentRef = doc(db, 'payments', merchantReferenceId);
          const paymentDoc = await getDoc(paymentRef);
          
          if (paymentDoc.exists()) {
            setPaymentData(paymentDoc.data());
          }
        }
      } catch (error) {
        console.error(t('payment.success.errors.fetchData'), error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [searchParams, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('payment.success.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white" dir="rtl">
      <div className="container px-4 py-16 mx-auto max-w-2xl">
        <div className="text-center">
          {/* أيقونة النجاح */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-white">✅</span>
            </div>
          </div>

          {/* عنوان النجاح */}
          <h1 className="text-3xl font-bold text-green-700 mb-4">
            {t('payment.success.title')} 🎉
          </h1>

          {/* رسالة النجاح */}
          <p className="text-lg text-gray-700 mb-8">
            {t('payment.success.message')}
          </p>

          {/* تفاصيل الدفع */}
          {paymentData && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('payment.success.paymentDetails')}</h2>
              <div className="space-y-3 text-right">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('payment.success.orderNumber')}:</span>
                  <span className="font-medium">{paymentData.transactionNumber || t('payment.success.notAvailable')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('payment.success.amount')}:</span>
                  <span className="font-medium">{paymentData.amount} {paymentData.currencySymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('payment.success.package')}:</span>
                  <span className="font-medium">{paymentData.packageType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('payment.success.paymentDate')}:</span>
                  <span className="font-medium">
                    {paymentData.createdAt?.toDate?.()?.toLocaleDateString('ar-EG') || 
                     new Date().toLocaleDateString('ar-EG')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* معلومات إضافية */}
          <div className="bg-blue-50 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-blue-800 mb-3">{t('payment.success.whatsNext')}</h3>
            <ul className="text-right space-y-2 text-blue-700">
              <li className="flex items-center gap-2">
                <span className="text-blue-500">✓</span>
                {t('payment.success.nextSteps.subscriptionActivated')}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">✓</span>
                {t('payment.success.nextSteps.accessFeatures')}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">✓</span>
                {t('payment.success.nextSteps.notifications')}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">✓</span>
                {t('payment.success.nextSteps.support')}
              </li>
            </ul>
          </div>

          {/* أزرار التنقل */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              {t('payment.success.buttons.dashboard')}
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-8 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-colors"
            >
              {t('payment.success.buttons.home')}
            </button>
          </div>

          {/* رسالة الدعم */}
          <div className="mt-8 p-4 bg-yellow-50 rounded-xl">
            <p className="text-sm text-yellow-800">
              {t('payment.success.supportMessage')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
