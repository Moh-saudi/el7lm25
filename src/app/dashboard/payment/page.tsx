'use client';

import DashboardLayout from "@/components/layout/DashboardLayout.jsx";
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import 'react-photo-view/dist/react-photo-view.css';


// أنواع البيانات
interface PackageType {
  title: string;
  price: number;
  originalPrice: number;
  period: string;
  discount: string;
  features: string[];
  popular: boolean;
  icon: string;
}

interface PaymentInfo {
  transactionNumber: string;
  packageType: string;
  amount: number;
  receiptUrl?: string;
  status: 'pending' | 'completed' | 'failed';
}

// تكوين الباقات (3 خطط)
const PACKAGES: Record<string, PackageType> = {
  '3months': {
    title: 'باقة النجم الصاعد ⭐',
    price: 70,
    originalPrice: 100,
    period: '3 شهور',
    discount: '30%',
    features: [
      'إنشاء ملف شخصي احترافي كامل',
      'إضافة صور وفيديوهات غير محدودة',
      'إمكانية التواصل مع الأندية مباشرة',
      'ظهور ملفك في نتائج البحث للأندية',
      'دعم فني عبر البريد الإلكتروني',
      'تحديث بياناتك في أي وقت',
      'إشعارات بالعروض الجديدة',
    ],
    popular: false,
    icon: '⭐'
  },
  '6months': {
    title: 'باقة النجم الذهبي 🏅',
    price: 120,
    originalPrice: 160,
    period: '6 شهور',
    discount: '25%',
    features: [
      'كل ميزات النجم الصاعد',
      'إعلانات مميزة في البحث',
      'دعم فني أسرع عبر الواتساب',
      'إمكانية إضافة روابط سوشيال ميديا',
      'تحليل أداء ملفك وزياراته',
      'أولوية في الظهور للأندية',
      'إشعار عند مشاهدة ملفك',
    ],
    popular: true,
    icon: '🏅'
  },
  '12months': {
    title: 'باقة النجم الأسطوري 👑',
    price: 180,
    originalPrice: 200,
    period: '12 شهر',
    discount: '10%',
    features: [
      'كل ميزات النجم الذهبي',
      'ترويج خاص على منصات التواصل الاجتماعي',
      'شهادة اشتراك مميزة',
      'استشارة مجانية مع خبير تسويق رياضي',
      'إمكانية تثبيت ملفك في أعلى نتائج البحث',
      'دعم فني VIP على مدار الساعة',
      'تقرير شهري مفصل عن أداء ملفك',
    ],
    popular: false,
    icon: '👑'
  }
};

// خيارات الدفع مع الأيقونات
const PAYMENT_METHODS = [
  { id: 'bank', name: 'تحويل بنكي', icon: '🏦' },
  { id: 'fawry', name: 'فوري', icon: '💸' },
  { id: 'apple', name: 'أبل باي', icon: '🍎' },
  { id: 'wallet', name: 'تحويل على محفظة', icon: '👛' }
];

// دول الخليج
const GULF_COUNTRIES = ['QA', 'SA', 'AE', 'KW', 'BH', 'OM'];

// حسّن دالة تحويل اسم الدولة إلى رمزها القياسي
function normalizeCountry(val: string | undefined | null): string {
  if (!val) return '';
  const map: Record<string, string> = {
    'قطر': 'QA', 'Qatar': 'QA',
    'السعودية': 'SA', 'Saudi Arabia': 'SA',
    'الإمارات': 'AE', 'UAE': 'AE', 'United Arab Emirates': 'AE',
    'الكويت': 'KW', 'Kuwait': 'KW',
    'البحرين': 'BH', 'Bahrain': 'BH',
    'عمان': 'OM', 'Oman': 'OM',
    'مصر': 'EG', 'Egypt': 'EG',
  };
  return map[val.trim()] || val.trim().toUpperCase();
}

export default function PaymentPage() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [selectedPackage, setSelectedPackage] = useState<string>('3months');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [transactionNumber, setTransactionNumber] = useState<string>('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [receiptInfo, setReceiptInfo] = useState({
    senderName: '',
    transferDate: '',
    notes: ''
  });
  const [bankInfo, setBankInfo] = useState({
    accountName: '',
    accountNumber: '',
    bankName: ''
  });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string>('');
  const [paidAmount, setPaidAmount] = useState('');
  const [userCurrency, setUserCurrency] = useState({ code: 'SAR', symbol: 'ر.س' });
  const [userCountry, setUserCountry] = useState('');
  const [savedTokens, setSavedTokens] = useState<string[]>([]);
  const [cardDetails, setCardDetails] = useState<any[]>([]);

  // كود تشخيصي
  console.log('user:', user, 'loading:', loading);

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // عند تغيير selectedPackage، حدّث قيمة paidAmount تلقائيًا
  useEffect(() => {
    setPaidAmount(PACKAGES[selectedPackage].price.toString());
  }, [selectedPackage]);

  // حسّن منطق جلب الدولة والعملة
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          let userData = {};
          if (userDoc.exists()) {
            userData = userDoc.data();
          }
          // جلب الدولة من Firestore أو من user أو قيمة افتراضية
          let country = normalizeCountry((userData as any)?.country)
            || normalizeCountry((user as any)?.country)
            || normalizeCountry((user as any)?.metadata?.country)
            || '';
          if (!country && (userData as any)?.address) {
            // محاولة استخراج الدولة من العنوان إذا كان موجودًا
            const match = (userData as any)?.address.match(/(قطر|السعودية|الإمارات|الكويت|البحرين|عمان|مصر|Qatar|Saudi Arabia|UAE|United Arab Emirates|Kuwait|Bahrain|Oman|Egypt)/);
            if (match) country = normalizeCountry(match[0]);
          }
          setUserCountry(country || '');
          // جلب العملة من Firestore أو user أو افتراضية حسب الدولة
          let currency = (userData as any)?.currency || (user as any)?.currency || '';
          let currencySymbol = (userData as any)?.currencySymbol || (user as any)?.currencySymbol || '';
          if (!currency) {
            switch (country) {
              case 'QA': currency = 'QAR'; currencySymbol = 'ر.ق'; break;
              case 'SA': currency = 'SAR'; currencySymbol = 'ر.س'; break;
              case 'AE': currency = 'AED'; currencySymbol = 'د.إ'; break;
              case 'KW': currency = 'KWD'; currencySymbol = 'د.ك'; break;
              case 'BH': currency = 'BHD'; currencySymbol = 'د.ب'; break;
              case 'OM': currency = 'OMR'; currencySymbol = 'ر.ع'; break;
              default: currency = 'SAR'; currencySymbol = 'ر.س'; break;
            }
          }
          setUserCurrency({ code: currency, symbol: currencySymbol });
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    fetchUserData();
  }, [user]);

  // جلب التوكنات من Firestore عند تحميل الصفحة
  useEffect(() => {
    const fetchTokensAndCards = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          let userData: any = userDoc.exists() ? userDoc.data() : {};
          const tokens: string[] = userData?.tokens || [];
          setSavedTokens(tokens);
          if (tokens.length > 0) {
            // جلب تفاصيل البطاقات من SkipCash
            const ids = tokens.join('|');
            const res = await fetch(`/api/skipcash/cards?ids=${ids}`);
            const data = await res.json();
            setCardDetails(data.resultObj || []);
          }
        } catch (err) {
          console.error('Error fetching tokens/cards:', err);
        }
      }
    };
    fetchTokensAndCards();
  }, [user]);

  // معالجة تقديم الدفع
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    // التحقق من البيانات الأساسية
    if (!selectedPackage || !paymentMethod) {
      setError('يرجى اختيار الباقة وطريقة الدفع');
      return;
    }

    setSubmitting(true);
    try {
      const months = selectedPackage === '3months' ? 3 : selectedPackage === '6months' ? 6 : 12;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + months);
      setSubscriptionEnd(endDate.toLocaleDateString('ar-EG'));

      // جلب بيانات العميل من قاعدة البيانات
      type UserProfile = {
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
        taxNumber?: string;
        currency?: string;
        currencySymbol?: string;
      };
      let userProfile: UserProfile = {};
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          userProfile = userDoc.data() as UserProfile;
        }
      } catch (e) {
        console.warn('تعذر جلب بيانات العميل من قاعدة البيانات:', e);
      }

      // حفظ بيانات الدفع
      await setDoc(doc(db, 'payments', `${user.uid}-${Date.now()}`), {
        transactionNumber: transactionNumber || '',
        packageType: selectedPackage || '',
        amount: PACKAGES[selectedPackage]?.price || 0,
        paidAmount: Number(paidAmount),
        paymentMethod: paymentMethod || '',
        userId: user.uid,
        createdAt: startDate,
        subscriptionEnd: endDate,
        receiptInfo: receiptInfo || {},
        bankInfo: paymentMethod === 'bank' ? bankInfo : null,
        status: 'pending',
        currency: userCurrency.code,
        currencySymbol: userCurrency.symbol
      });

      // تفعيل الاشتراك في users
      await setDoc(doc(db, 'users', user.uid), {
        subscription: {
          type: selectedPackage,
          start: startDate,
          end: endDate,
          status: 'active'
        }
      }, { merge: true });

      // حفظ بيانات الاشتراك في subscriptions
      await setDoc(doc(db, 'subscriptions', user.uid), {
        plan_name: PACKAGES[selectedPackage]?.title || '',
        start_date: startDate,
        end_date: endDate,
        status: 'pending',
        payment_method: paymentMethod || '',
        amount: PACKAGES[selectedPackage]?.price || 0,
        currency: userCurrency.code,
        currencySymbol: userCurrency.symbol,
        paidAmount: Number(paidAmount),
        receiptInfo: receiptInfo || {},
        bankInfo: paymentMethod === 'bank' ? bankInfo : null,
        autoRenew: false,
        transaction_id: transactionNumber || '',
        invoice_number: `INV-${user.uid?.slice(0,6) || '000000'}-${Date.now()}`,
        customer_name: userProfile.name || user.displayName || receiptInfo.senderName || '',
        customer_email: userProfile.email || user.email || '',
        customer_phone: userProfile.phone || user.phoneNumber || '',
        billing_address: userProfile.address || '',
        tax_number: userProfile.taxNumber || '',
        payment_date: receiptInfo.transferDate || startDate.toISOString(),
      });

      setShowSuccessPopup(true);
      setSuccess(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
        router.push('/dashboard');
      }, 6000);
    } catch (error) {
      console.error('تفاصيل الخطأ أثناء حفظ بيانات الدفع أو الاشتراك:', error);
      setError('حدث خطأ أثناء معالجة الدفع. يرجى التأكد من اتصالك بالإنترنت وصلاحيات الحساب. إذا استمرت المشكلة راجع الإدارة.');
    } finally {
      setSubmitting(false);
    }
  };

  // دالة الدفع باستخدام بطاقة محفوظة (tokenId)
  const handleTokenPayment = async (tokenId: string) => {
    if (!user) return setError('يجب تسجيل الدخول أولاً');
    setSubmitting(true);
    setError('');
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData: any = userDoc.exists() ? userDoc.data() : {};
      const firstName = userData?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || '';
      const lastName = userData?.name?.split(' ')[1] || user?.displayName?.split(' ')[1] || '';
      const phone = userData?.phone || user?.phoneNumber || '';
      const email = userData?.email || user?.email || `${phone}@yourdomain.com`;
      const transactionId = `${user.uid}-${Date.now()}`;
      const amount = PACKAGES[selectedPackage]?.price?.toFixed(2) || '0.00';
      const subject = PACKAGES[selectedPackage]?.title || 'اشتراك';
      const description = `دفع اشتراك باقة ${PACKAGES[selectedPackage]?.title || ''}`;
      // إرسال الطلب إلى API مع tokenId
      const response = await fetch('/api/skipcash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          firstName,
          lastName,
          phone,
          email,
          transactionId,
          subject,
          description,
          tokenId,
        }),
      });
      const data = await response.json();
      if (data.payUrl) {
        window.location.href = data.payUrl;
      } else {
        setError(
          data.errorMessage ||
          data.error ||
          data.message ||
          JSON.stringify(data, null, 2) ||
          'حدث خطأ أثناء إنشاء طلب الدفع عبر البطاقة المحفوظة'
        );
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء معالجة الدفع عبر البطاقة المحفوظة');
    } finally {
      setSubmitting(false);
    }
  };

  // أضف دالة الدفع عبر QPAY (يجب أن تكون داخل PaymentPage)
  const handleSkipCashPayment = async () => {
    if (!user) return setError('يجب تسجيل الدخول أولاً');
    setSubmitting(true);
    setError('');
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData: any = userDoc.exists() ? userDoc.data() : {};
      const firstName = userData?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || '';
      const lastName = userData?.name?.split(' ')[1] || user?.displayName?.split(' ')[1] || '';
      const phone = userData?.phone || user?.phoneNumber || '';
      const email = userData?.email || user?.email || `${phone}@yourdomain.com`;
      const transactionId = `${user.uid}-${Date.now()}`;
      const amount = PACKAGES[selectedPackage]?.price?.toFixed(2) || '0.00';
      const subject = PACKAGES[selectedPackage]?.title || 'اشتراك';
      const description = `دفع اشتراك باقة ${PACKAGES[selectedPackage]?.title || ''}`;
      // إرسال الطلب إلى API
      const response = await fetch('/api/skipcash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          firstName,
          lastName,
          phone,
          email,
          transactionId,
          subject,
          description,
        }),
      });
      const data = await response.json();
      if (data.payUrl) {
        window.location.href = data.payUrl;
      } else {
        setError(
          data.errorMessage ||
          data.error ||
          data.message ||
          JSON.stringify(data, null, 2) ||
          'حدث خطأ أثناء إنشاء طلب الدفع عبر QPAY'
        );
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء معالجة الدفع عبر QPAY');
    } finally {
      setSubmitting(false);
    }
  };

  // عرض حالة التحميل
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>;
  }

  // منطق طرق الدفع حسب الدولة
  let paymentMethods: { id: string, name: string, icon: string }[] = [];
  if (GULF_COUNTRIES.includes(userCountry)) {
    paymentMethods = [
      { id: 'qpay', name: 'الدفع عبر QPAY (بطاقة خليجية)', icon: '💳' },
      { id: 'apple', name: 'أبل باي', icon: '🍎' },
      { id: 'google', name: 'جوجل باي', icon: '🟢' },
      { id: 'wallet', name: 'تحويل على محفظة (97472053188)', icon: '👛' },
      { id: 'fawry', name: 'فوري', icon: '💸' },
    ];
  } else if (userCountry === 'EG') {
    paymentMethods = [
      { id: 'bank', name: 'تحويل بنكي', icon: '🏦' },
      { id: 'fawry', name: 'فوري', icon: '💸' },
      { id: 'wallet', name: 'تحويل على محفظة', icon: '👛' },
    ];
  } else {
    paymentMethods = [];
  }

  // إذا لم تتوفر الدولة، أظهر رسالة تنبيه
  if (!userCountry) {
    return (
      <div className="p-4 mb-6 text-yellow-800 bg-yellow-100 border-2 border-yellow-300 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <p>يرجى تحديد الدولة في الملف الشخصي حتى تظهر لك جميع خيارات الدفع المناسبة.</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white" dir="rtl">
        <div className="container px-4 py-8 mx-auto max-w-7xl">
          {/* عنوان الصفحة */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">اشترك الآن</h1>
            <p className="text-gray-600">اختر الباقة المناسبة لك وابدأ رحلة النجاح</p>
          </div>

          {/* عرض الباقات */}
          <div className="grid gap-8 mb-12 md:grid-cols-3">
            {Object.entries(PACKAGES).map(([key, pkg]) => (
              <div
                key={key}
                className={`relative p-6 transition-all duration-300 transform border-2 rounded-2xl hover:scale-105 ${
                  selectedPackage === key
                    ? 'border-blue-500 shadow-xl bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
                onClick={() => setSelectedPackage(key)}
              >
                {/* شارة الأكثر شعبية */}
                {pkg.popular && (
                  <div className="absolute px-3 py-1 text-sm font-medium text-white transform -translate-y-1/2 bg-yellow-500 rounded-full -top-3 right-6">
                    الأكثر شعبية
                  </div>
                )}

                {/* أيقونة الباقة */}
                <div className="mb-4 text-4xl text-center">{pkg.icon}</div>

                {/* عنوان الباقة */}
                <h3 className="mb-2 text-xl font-bold text-center text-gray-900">{pkg.title}</h3>

                {/* السعر */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-blue-600">{pkg.price} {userCurrency.symbol}</span>
                  <span className="text-sm text-gray-500 line-through">{pkg.originalPrice} {userCurrency.symbol}</span>
                  <span className="px-2 py-1 text-xs font-medium text-white bg-green-500 rounded-full">
                    {pkg.discount} خصم
                  </span>
                </div>

                {/* المدة */}
                <div className="mb-4 text-center">
                  <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full">
                    {pkg.period}
                  </span>
                </div>

                {/* المميزات */}
                <ul className="space-y-3">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* طرق الدفع */}
          {paymentMethods.length === 0 ? (
            <div className="p-4 mb-6 text-yellow-800 bg-yellow-100 border-2 border-yellow-300 rounded-xl">
              <span>طرق الدفع غير متاحة حالياً لدولتك.</span>
            </div>
          ) : (
            <div className="p-6 mb-8 bg-white rounded-2xl shadow-lg">
              <h3 className="mb-4 text-xl font-bold text-gray-900">اختر طريقة الدفع</h3>
              <div className="grid gap-4 md:grid-cols-4">
                {paymentMethods.map(method => (
                  <label
                    key={method.id}
                    className={`flex flex-col items-center p-4 transition-all duration-200 border-2 rounded-xl cursor-pointer hover:border-blue-300 ${
                      paymentMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="hidden"
                    />
                    <span className="mb-2 text-2xl">{method.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{method.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* تعليمات خاصة عند اختيار تحويل على محفظة */}
          {paymentMethod === 'wallet' && (
            <div className="p-6 mb-8 text-center bg-yellow-50 border-2 border-yellow-200 rounded-2xl">
              <h4 className="mb-3 text-lg font-bold text-yellow-800">تعليمات التحويل</h4>
              <p className="mb-2 text-yellow-700">
                {userCountry === 'EG'
                  ? <>يرجى التحويل على محفظة <b>فودافون كاش</b> أو <b>انستا باي</b> على الرقم:</>
                  : <>يرجى التحويل على محفظة محلية (مثل <b>STC Pay</b> أو <b>فودافون قطر</b>) على الرقم:</>
                }
              </p>
              <div className="p-3 mb-3 text-xl font-bold text-yellow-900 bg-yellow-100 rounded-lg select-all">
                {userCountry === 'EG' ? '01017799580' : '97472053188'}
              </div>
              <p className="text-sm text-yellow-600">
                يرجى رفع صورة إيصال التحويل بعد الدفع
              </p>
            </div>
          )}

          {/* عند اختيار QPAY، أظهر زر الدفع */}
          {paymentMethod === 'qpay' && (
            <div className="flex flex-col items-center gap-4 my-6">
              <button
                type="button"
                onClick={handleSkipCashPayment}
                className="w-full p-4 text-white font-bold rounded-xl bg-blue-700 hover:bg-blue-800 transition-all duration-200 shadow-lg text-lg"
              >
                الدفع عبر QPAY (بطاقة خليجية)
              </button>
              <p className="text-sm text-gray-600">سيتم تحويلك لبوابة الدفع الآمنة لإتمام العملية عبر بطاقة خليجية.</p>
            </div>
          )}

          {/* رسائل الخطأ والنجاح */}
          {error && (
            <div className="p-4 mb-6 text-red-700 bg-red-100 border-2 border-red-200 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <p>{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 mb-6 text-green-700 bg-green-100 border-2 border-green-200 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xl">✅</span>
                <p>تم استلام طلب الدفع بنجاح! جاري تحويلك...</p>
              </div>
            </div>
          )}

          {/* نموذج الدفع */}
          <form onSubmit={handleSubmit} className="p-6 bg-white rounded-2xl shadow-lg">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">رقم العملية البنكية</label>
                <input
                  type="text"
                  value={transactionNumber}
                  onChange={e => setTransactionNumber(e.target.value)}
                  className="w-full p-3 text-gray-700 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="أدخل رقم العملية البنكية"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">قيمة المبلغ المحول (جنيه)</label>
                <input
                  type="number"
                  min="1"
                  value={paidAmount}
                  readOnly
                  className="w-full p-3 text-gray-700 border-2 border-gray-200 rounded-xl bg-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="مثال: 120"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">اسم المحول</label>
                <input
                  type="text"
                  value={receiptInfo.senderName}
                  onChange={e => setReceiptInfo(prev => ({ ...prev, senderName: e.target.value }))}
                  className="w-full p-3 text-gray-700 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="اسم صاحب التحويل"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">تاريخ التحويل</label>
                <input
                  type="date"
                  value={receiptInfo.transferDate}
                  onChange={e => setReceiptInfo(prev => ({ ...prev, transferDate: e.target.value }))}
                  className="w-full p-3 text-gray-700 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">ملاحظات إضافية</label>
                <input
                  type="text"
                  value={receiptInfo.notes}
                  onChange={e => setReceiptInfo(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 text-gray-700 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="أي ملاحظات (اختياري)"
                />
              </div>
              {paymentMethod === 'bank' && (
                <>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">اسم صاحب الحساب البنكي</label>
                    <input
                      type="text"
                      value={bankInfo.accountName}
                      onChange={e => setBankInfo(prev => ({ ...prev, accountName: e.target.value }))}
                      className="w-full p-3 text-gray-700 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">رقم الحساب البنكي</label>
                    <input
                      type="text"
                      value={bankInfo.accountNumber}
                      onChange={e => setBankInfo(prev => ({ ...prev, accountNumber: e.target.value }))}
                      className="w-full p-3 text-gray-700 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">اسم البنك</label>
                    <input
                      type="text"
                      value={bankInfo.bankName}
                      onChange={e => setBankInfo(prev => ({ ...prev, bankName: e.target.value }))}
                      className="w-full p-3 text-gray-700 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                </>
              )}
            </div>
            <div className="mt-6">
              <button
                type="submit"
                disabled={submitting}
                className={`w-full p-4 text-white font-medium rounded-xl transition-all duration-200 ${
                  submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                }`}
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري الإرسال...
                  </div>
                ) : (
                  'إرسال طلب الدفع'
                )}
              </button>
            </div>
          </form>

          {/* بطاقات الدفع */}
          {cardDetails.length > 0 && (
            <div className="p-6 mb-8 bg-white rounded-2xl shadow-lg">
              <h3 className="mb-4 text-xl font-bold text-gray-900">بطاقاتك المحفوظة</h3>
              <div className="grid gap-4 md:grid-cols-3">
                {cardDetails.map((card, idx) => (
                  <div key={idx} className="flex flex-col items-center p-4 border-2 rounded-xl">
                    <span className="text-2xl mb-2">{card.cardType === 1 ? '💳 Visa' : card.cardType === 2 ? '💳 MasterCard' : '💳 بطاقة'}</span>
                    <span className="mb-1">**** **** **** {card.cardNumber}</span>
                    <span className="mb-1 text-gray-600">تنتهي: {card.cardExpiry}</span>
                    <button
                      type="button"
                      onClick={() => handleTokenPayment(savedTokens[idx])}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      الدفع بهذه البطاقة
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="p-8 bg-white rounded-3xl shadow-2xl text-center animate-bounceIn">
            <div className="mb-4 text-5xl">🎉</div>
            <h2 className="mb-2 text-2xl font-bold text-green-700">تم إرسال بيانات الدفع بنجاح!</h2>
            <p className="mb-2 text-lg text-gray-700">تم استلام طلبك وسيتم مراجعته من الإدارة خلال 24 ساعة.</p>
            <p className="mb-2 text-md text-blue-600 font-semibold">سيتواصل معك فريقنا لتفعيل الاشتراك بعد مراجعة المستندات.</p>
            <p className="mb-2 text-md text-gray-600">صلاحية الاشتراك حتى <span className="font-bold text-green-600">{subscriptionEnd}</span></p>
            <div className="mt-4 text-3xl animate-bounce">🚀</div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
