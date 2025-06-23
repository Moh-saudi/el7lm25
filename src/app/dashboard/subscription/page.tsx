'use client';

import DashboardLayout from "@/components/layout/DashboardLayout.jsx";
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Calendar, CreditCard, CheckCircle, Clock, AlertCircle, Star, Crown } from 'lucide-react';
import { getCurrencyByCountry } from '@/lib/currency-converter';
import { getCountryFromCity } from '@/lib/cities-data';

// دالة لتطبيع أسماء الدول
const normalizeCountry = (country: string | undefined): string => {
  if (!country) return '';
  
  const countryMap: Record<string, string> = {
    'السعودية': 'السعودية',
    'المملكة العربية السعودية': 'السعودية',
    'saudi arabia': 'السعودية',
    'مصر': 'مصر',
    'egypt': 'مصر',
    'الإمارات': 'الإمارات',
    'الإمارات العربية المتحدة': 'الإمارات',
    'uae': 'الإمارات',
    'قطر': 'قطر',
    'qatar': 'قطر',
    'الكويت': 'الكويت',
    'kuwait': 'الكويت',
    'البحرين': 'البحرين',
    'bahrain': 'البحرين',
    'عمان': 'عمان',
    'oman': 'عمان',
    'الأردن': 'الأردن',
    'jordan': 'الأردن',
    'لبنان': 'لبنان',
    'lebanon': 'لبنان',
    'المغرب': 'المغرب',
    'morocco': 'المغرب',
    'تونس': 'تونس',
    'tunisia': 'تونس',
    'الجزائر': 'الجزائر',
    'algeria': 'الجزائر',
    'ليبيا': 'ليبيا',
    'libya': 'ليبيا',
    'السودان': 'السودان',
    'sudan': 'السودان',
    'العراق': 'العراق',
    'iraq': 'العراق',
    'سوريا': 'سوريا',
    'syria': 'سوريا',
    'فلسطين': 'فلسطين',
    'palestine': 'فلسطين',
    'اليمن': 'اليمن',
    'yemen': 'اليمن'
  };
  
  const lowercaseCountry = country.toLowerCase().trim();
  const normalized = countryMap[lowercaseCountry];
  
  return normalized || country;
};

interface SubscriptionData {
  plan_name: string;
  start_date: any;
  end_date: any;
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  payment_method: string;
  amount: number;
  currency: string;
  currencySymbol: string;
  autoRenew: boolean;
  transaction_id: string;
  invoice_number: string;
}

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

export default function SubscriptionPage() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [userCurrency, setUserCurrency] = useState({ code: 'SAR', symbol: 'ر.س' });
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!user) return;

      try {
        setLoadingSubscription(true);

        // جلب بيانات الاشتراك من Firestore
        const subscriptionDoc = await getDoc(doc(db, 'subscriptions', user.uid));
        
        if (subscriptionDoc.exists()) {
          const data = subscriptionDoc.data() as SubscriptionData;
          
          // تحويل التواريخ
          const startDate = data.start_date?.toDate ? data.start_date.toDate() : new Date(data.start_date);
          const endDate = data.end_date?.toDate ? data.end_date.toDate() : new Date(data.end_date);
          
          // تحديد حالة الاشتراك
          const now = new Date();
          let status = data.status;
          
          if (status === 'active' && endDate < now) {
            status = 'expired';
          }

          setSubscription({
            ...data,
            start_date: startDate,
            end_date: endDate,
            status: status
          });
        }

        // جلب بيانات المستخدم من مصادر متعددة (users و players)
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        let userFromUsers = {};
        if (userDoc.exists()) {
          userFromUsers = userDoc.data();
        }

        // جلب من players إذا لم توجد القيم في users
        let playerData = {};
        const playerDoc = await getDoc(doc(db, 'players', user.uid));
        if (playerDoc.exists()) {
          playerData = playerDoc.data();
        }

        // استخدم أول قيمة غير فارغة بين المجموعتين
        let country = (userFromUsers as any)?.country || (playerData as any)?.country || '';
        const city = (userFromUsers as any)?.city || (playerData as any)?.city || '';
        
        // تصحيح تلقائي للدولة بناءً على المدينة (لحل مشكلة البيانات الخاطئة)
        let correctedCountry = country;
        if (city) {
          const countryFromCity = getCountryFromCity(city);
          if (countryFromCity && countryFromCity !== country) {
            correctedCountry = countryFromCity;
            console.log(`🔧 تصحيح تلقائي في صفحة الاشتراك: المدينة "${city}" تنتمي للدولة "${countryFromCity}"`);
          }
        }
        
        const combinedUserData = { ...userFromUsers, country: correctedCountry, city };
        setUserData(combinedUserData);

        // تحديد العملة بناءً على الدولة من الملف الشخصي
        const normalizedCountry = normalizeCountry(correctedCountry);
        
        if (normalizedCountry) {
          const localCurrency = getCurrencyByCountry(normalizedCountry);
          console.log(`💰 عملة صفحة الاشتراك: ${localCurrency.code} (${localCurrency.symbol}) بناءً على الدولة: ${correctedCountry}`);
          
          setUserCurrency({
            code: localCurrency.code,
            symbol: localCurrency.symbol
          });
        } else {
          // إذا لم توجد بيانات الدولة، حاول من بيانات العملة المحفوظة مسبقاً
          const savedUserData = userFromUsers as any;
          if (savedUserData.currency && savedUserData.currencySymbol) {
            setUserCurrency({
              code: savedUserData.currency,
              symbol: savedUserData.currencySymbol
            });
            console.log(`💰 استخدام العملة المحفوظة: ${savedUserData.currency} (${savedUserData.currencySymbol})`);
          } else {
            console.log(`💰 استخدام العملة الافتراضية: SAR (ر.س)`);
          }
        }

      } catch (error) {
        console.error('Error fetching subscription data:', error);
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchSubscriptionData();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'expired': return 'منتهي الصلاحية';
      case 'pending': return 'في انتظار التأكيد';
      case 'cancelled': return 'ملغي';
      default: return 'غير معروف';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-5 h-5" />;
      case 'expired': return <AlertCircle className="w-5 h-5" />;
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'cancelled': return <AlertCircle className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: Date) => {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading || loadingSubscription) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white" dir="rtl">
        <div className="container px-4 py-8 mx-auto max-w-7xl">
          {/* عنوان الصفحة */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">الاشتراكات</h1>
            <p className="text-gray-600">إدارة اشتراكك ومراقبة حالة الدفع</p>
            {userData?.country && (
              <p className="text-sm text-blue-600 mt-2">
                🌍 الدولة: {userData.country} | 💰 العملة: {userCurrency.code} ({userCurrency.symbol})
              </p>
            )}
          </div>

          {/* حالة الاشتراك الحالي */}
          {subscription ? (
            <div className="mb-8">
              <div className="p-6 bg-white rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">اشتراكك الحالي</h2>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(subscription.status)}`}>
                    {getStatusIcon(subscription.status)}
                    <span className="font-medium">{getStatusText(subscription.status)}</span>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* تفاصيل الباقة */}
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">الباقة</h3>
                    </div>
                    <p className="text-lg font-bold text-blue-600">{subscription.plan_name}</p>
                    <p className="text-sm text-gray-600">{subscription.amount} {subscription.currencySymbol}</p>
                  </div>

                  {/* تاريخ البداية */}
                  <div className="p-4 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-gray-900">تاريخ البداية</h3>
                    </div>
                    <p className="text-lg font-bold text-green-600">{formatDate(subscription.start_date)}</p>
                  </div>

                  {/* تاريخ الانتهاء */}
                  <div className="p-4 bg-orange-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-orange-600" />
                      <h3 className="font-semibold text-gray-900">تاريخ الانتهاء</h3>
                    </div>
                    <p className="text-lg font-bold text-orange-600">{formatDate(subscription.end_date)}</p>
                    {subscription.status === 'active' && (
                      <p className="text-sm text-orange-600">
                        متبقي {getDaysRemaining(subscription.end_date)} يوم
                      </p>
                    )}
                  </div>

                  {/* طريقة الدفع */}
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-gray-900">طريقة الدفع</h3>
                    </div>
                    <p className="text-lg font-bold text-purple-600">
                      {subscription.payment_method === 'geidea' ? 'بطاقة ائتمان/مدى' : subscription.payment_method}
                    </p>
                  </div>

                  {/* رقم العملية */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">رقم العملية</h3>
                    </div>
                    <p className="text-sm font-mono text-gray-600">{subscription.transaction_id || 'غير متوفر'}</p>
                  </div>

                  {/* رقم الفاتورة */}
                  <div className="p-4 bg-indigo-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-semibold text-gray-900">رقم الفاتورة</h3>
                    </div>
                    <p className="text-sm font-mono text-indigo-600">{subscription.invoice_number}</p>
                  </div>
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => router.push('/dashboard/payment')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    تجديد الاشتراك
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    العودة للوحة التحكم
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* لا يوجد اشتراك نشط */
            <div className="mb-8">
              <div className="p-8 text-center bg-yellow-50 border-2 border-yellow-200 rounded-2xl">
                <div className="mb-4 text-6xl">⚠️</div>
                <h2 className="mb-2 text-2xl font-bold text-yellow-800">لا يوجد اشتراك نشط</h2>
                <p className="mb-6 text-yellow-700">
                  لم يتم العثور على اشتراك نشط لحسابك. اشترك الآن للاستمتاع بجميع المميزات!
                </p>
                <button
                  onClick={() => router.push('/dashboard/payment')}
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                >
                  اشترك الآن
                </button>
              </div>
            </div>
          )}

          {/* الباقات المتاحة */}
          <div className="mb-8">
            <h2 className="mb-6 text-2xl font-bold text-center text-gray-900">الباقات المتاحة</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {Object.entries(PACKAGES).map(([key, pkg]) => (
                <div
                  key={key}
                  className="relative p-6 transition-all duration-300 transform border-2 rounded-2xl hover:scale-105 border-gray-200 bg-white hover:border-blue-300"
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
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* زر الاشتراك */}
                  <button
                    onClick={() => router.push('/dashboard/payment')}
                    className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    اشترك الآن
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 