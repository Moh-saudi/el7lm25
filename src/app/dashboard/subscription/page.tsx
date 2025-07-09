"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { AlertCircle, Clock, Download, Printer, Users, Crown, Shield, Star, Gift, Zap, Trophy, CreditCard, Smartphone, Wallet, Check, ArrowLeft, Upload, FileImage, Plus, Search, X, Globe, AlertTriangle, CheckCircle, ExternalLink, Settings, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

import { auth, db } from '@/lib/firebase/config';
import { getCurrencyRates, convertCurrency as convertCurrencyLib, getCurrencyInfo, getRatesAge, forceUpdateRates } from '@/lib/currency-rates';

interface SubscriptionStatus {
  plan_name: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  payment_method: string;
  amount: number;
  currency: string;
  currencySymbol: string;
  receipt_url?: string;
  receipt_uploaded_at?: string;
  autoRenew: boolean;
  transaction_id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  billing_address?: string;
  tax_number?: string;
  payment_date: string;
  accountType?: string;
  packageType?: string;
  selectedPackage?: string;
}

// باقات الاشتراك العالمية (بالدولار) - نفس البيانات من BulkPaymentPage
const BULK_PACKAGES_USD = {
  'subscription_3months': {
    title: 'اشتراك 3 شهور',
    subtitle: 'للتجربة والبداية',
    price: 20,
    originalPrice: 30,
    period: '3 شهور',
    discount: '33%',
    color: 'blue',
    features: [
      'الوصول لجميع الميزات الأساسية',
      'تقارير شهرية',
      'الدعم الفني',
      'تطبيق الموبايل',
      'تحليل الأداء الأساسي',
      'شهادات الإنجاز',
      'النظام التعليمي'
    ],
    bonusFeatures: [
      'دورة تدريبية مجانية',
      'استشارة مجانية',
      'دعم 24/7'
    ],
    popular: false,
    icon: '📅'
  },
  'subscription_6months': {
    title: 'اشتراك 6 شهور',
    subtitle: 'الخيار الأذكى',
    price: 35,
    originalPrice: 60,
    period: '6 شهور',
    discount: '42%',
    color: 'purple',
    features: [
      'جميع ميزات 3 شهور',
      'تحليل متقدم بالذكاء الاصطناعي',
      'تقارير تفصيلية',
      'مدرب AI شخصي',
      'فيديوهات تدريبية حصرية',
      'ألعاب تفاعلية',
      'منصة إدارة شاملة'
    ],
    bonusFeatures: [
      'ورشة عمل مجانية',
      'تقييم شهري مفصل',
      'مجتمع VIP',
      'دعم أولوية'
    ],
    popular: true,
    icon: '👑'
  },
  'subscription_annual': {
    title: 'اشتراك سنوي',
    subtitle: 'أفضل قيمة وتوفير',
    price: 50,
    originalPrice: 120,
    period: '12 شهر',
    discount: '58%',
    color: 'emerald',
    features: [
      'جميع ميزات 6 شهور',
      'أكاديمية تدريب كاملة',
      'استوديو فيديو احترافي',
      'فريق دعم مخصص',
      'تحليل متطور جداً',
      'شبكة احترافية عالمية',
      'أدوات احترافية متقدمة'
    ],
    bonusFeatures: [
      'مؤتمر سنوي حصري',
      'جوائز وشهادات معتمدة',
      'لقاءات مع خبراء',
      'برنامج امتيازات VIP'
    ],
    popular: false,
    icon: '⭐'
  }
};

// باقات الاشتراك المصرية الخاصة (بالجنيه المصري)
const BULK_PACKAGES_EGP = {
  'subscription_3months': {
    title: 'اشتراك 3 شهور',
    subtitle: 'للتجربة والبداية',
    price: 80,
    originalPrice: 120,
    period: '3 شهور',
    discount: '33%',
    color: 'blue',
    features: [
      'الوصول لجميع الميزات الأساسية',
      'تقارير شهرية',
      'الدعم الفني',
      'تطبيق الموبايل',
      'تحليل الأداء الأساسي',
      'شهادات الإنجاز',
      'النظام التعليمي'
    ],
    bonusFeatures: [
      'دورة تدريبية مجانية',
      'استشارة مجانية',
      'دعم 24/7'
    ],
    popular: false,
    icon: '📅'
  },
  'subscription_6months': {
    title: 'اشتراك 6 شهور',
    subtitle: 'الخيار الأذكى',
    price: 120,
    originalPrice: 200,
    period: '6 شهور',
    discount: '40%',
    color: 'purple',
    features: [
      'جميع ميزات 3 شهور',
      'تحليل متقدم بالذكاء الاصطناعي',
      'تقارير تفصيلية',
      'مدرب AI شخصي',
      'فيديوهات تدريبية حصرية',
      'ألعاب تفاعلية',
      'منصة إدارة شاملة'
    ],
    bonusFeatures: [
      'ورشة عمل مجانية',
      'تقييم شهري مفصل',
      'مجتمع VIP',
      'دعم أولوية'
    ],
    popular: true,
    icon: '👑'
  },
  'subscription_annual': {
    title: 'اشتراك سنوي',
    subtitle: 'أفضل قيمة وتوفير',
    price: 180,
    originalPrice: 400,
    period: '12 شهر',
    discount: '55%',
    color: 'emerald',
    features: [
      'جميع ميزات 6 شهور',
      'أكاديمية تدريب كاملة',
      'استوديو فيديو احترافي',
      'فريق دعم مخصص',
      'تحليل متطور جداً',
      'شبكة احترافية عالمية',
      'أدوات احترافية متقدمة'
    ],
    bonusFeatures: [
      'مؤتمر سنوي حصري',
      'جوائز وشهادات معتمدة',
      'لقاءات مع خبراء',
      'برنامج امتيازات VIP'
    ],
    popular: false,
    icon: '⭐'
  }
};

function SubscriptionStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user] = useAuthState(auth);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [printing, setPrinting] = useState(false);
  const [currencyRates, setCurrencyRates] = useState<any>(null);
  const [userCountry, setUserCountry] = useState('US');
  const [currentCurrency, setCurrentCurrency] = useState('USD');

  useEffect(() => {
    const initializeData = async () => {
      try {
        // تحميل أسعار العملات
        const rates = await getCurrencyRates();
        setCurrencyRates(rates);
        
        // تحديد بلد المستخدم
        const country = await detectUserCountry();
        setUserCountry(country);
        
        // تحديد العملة الحالية
        const currency = getCurrentCurrency();
        setCurrentCurrency(currency);
        
        // جلب بيانات الاشتراك
        await fetchSubscriptionStatus();
      } catch (err) {
        console.error('Error initializing data:', err);
        setError('حدث خطأ أثناء تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [user]);

  const detectUserCountry = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return data.country_code || 'US';
    } catch (error) {
      console.error('Error detecting country:', error);
      return 'US';
    }
  };

  const getCurrentCurrency = () => {
    if (userCountry === 'EG') return 'EGP';
    if (userCountry === 'SA') return 'SAR';
    if (userCountry === 'AE') return 'AED';
    if (userCountry === 'KW') return 'KWD';
    if (userCountry === 'QA') return 'QAR';
    if (userCountry === 'BH') return 'BHD';
    if (userCountry === 'OM') return 'OMR';
    if (userCountry === 'JO') return 'JOD';
    if (userCountry === 'LB') return 'LBP';
    if (userCountry === 'TR') return 'TRY';
    if (userCountry === 'GB') return 'GBP';
    if (userCountry === 'FR' || userCountry === 'DE') return 'EUR';
    if (userCountry === 'MA') return 'MAD';
    if (userCountry === 'DZ') return 'DZD';
    if (userCountry === 'TN') return 'TND';
    return 'USD';
  };

  const fetchSubscriptionStatus = async () => {
    try {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // جلب بيانات الاشتراك من Firestore
      const subscriptionRef = doc(db, 'subscriptions', user.uid);
      const subscriptionDoc = await getDoc(subscriptionRef);

      if (subscriptionDoc.exists()) {
        const data = subscriptionDoc.data() as SubscriptionStatus;
        
        // إضافة معلومات إضافية من صفحة المدفوعات المجمعة
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          data.accountType = userData.accountType || 'player';
          data.packageType = userData.packageType || data.plan_name;
          data.selectedPackage = userData.selectedPackage || data.plan_name;
        }
        
        setSubscription(data);
      } else {
        // البحث في جدول المدفوعات المجمعة
        const paymentsRef = collection(db, 'bulk_payments');
        const paymentsQuery = query(paymentsRef, where('userId', '==', user.uid));
        const paymentsSnapshot = await getDocs(paymentsQuery);
        
        if (!paymentsSnapshot.empty) {
          const paymentData = paymentsSnapshot.docs[0].data();
          const subscriptionData: SubscriptionStatus = {
            plan_name: paymentData.selectedPackage || 'اشتراك أساسي',
            start_date: paymentData.paymentDate || new Date().toISOString(),
            end_date: paymentData.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            status: paymentData.status || 'active',
            payment_method: paymentData.paymentMethod || 'بطاقة ائتمان',
            amount: paymentData.amount || 0,
            currency: paymentData.currency || 'USD',
            currencySymbol: paymentData.currencySymbol || '$',
            receipt_url: paymentData.receiptUrl,
            autoRenew: paymentData.autoRenew || false,
            transaction_id: paymentData.transactionId || 'N/A',
            invoice_number: paymentData.invoiceNumber || `INV-${Date.now()}`,
            customer_name: paymentData.customerName || user.displayName || 'مستخدم',
            customer_email: paymentData.customerEmail || user.email || '',
            customer_phone: paymentData.customerPhone || '',
            payment_date: paymentData.paymentDate || new Date().toISOString(),
            accountType: paymentData.accountType || 'player',
            packageType: paymentData.selectedPackage,
            selectedPackage: paymentData.selectedPackage
          };
          setSubscription(subscriptionData);
        } else {
          setError('لم يتم العثور على بيانات الاشتراك');
        }
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError('حدث خطأ أثناء جلب بيانات الاشتراك');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'في انتظار التأكيد';
      case 'active':
        return 'نشط';
      case 'expired':
        return 'منتهي';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  const getPackageInfo = (packageType: string) => {
    const packages = currentCurrency === 'EGP' ? BULK_PACKAGES_EGP : BULK_PACKAGES_USD;
    return packages[packageType as keyof typeof packages] || null;
  };

  const handlePrintInvoice = () => {
    setPrinting(true);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setPrinting(false);
      return;
    }

    const packageInfo = getPackageInfo(subscription?.selectedPackage || subscription?.plan_name || '');
    const features = packageInfo?.features || [];
    const bonusFeatures = packageInfo?.bonusFeatures || [];

    const invoiceContent = `
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <title>فاتورة اشتراك - ${subscription?.plan_name}</title>
          <style>
            body { font-family: 'Cairo', Arial, sans-serif; padding: 0; margin: 0; background: #f7f7fa; }
            .invoice-container { max-width: 800px; margin: 40px auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px #0001; padding: 32px 24px; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 16px; margin-bottom: 24px; }
            .logo { height: 64px; }
            .company-info { text-align: left; font-size: 14px; color: #444; }
            .invoice-title { font-size: 2rem; color: #1a237e; font-weight: bold; letter-spacing: 1px; }
            .section-title { color: #1976d2; font-size: 1.1rem; margin-bottom: 8px; font-weight: bold; }
            .details-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            .details-table th, .details-table td { border: 1px solid #e0e0e0; padding: 10px 8px; text-align: right; font-size: 15px; }
            .details-table th { background: #f0f4fa; color: #1a237e; }
            .details-table td { background: #fafbfc; }
            .summary { margin: 24px 0; font-size: 1.1rem; }
            .summary strong { color: #1976d2; }
            .footer { border-top: 2px solid #eee; padding-top: 16px; margin-top: 24px; text-align: center; color: #555; font-size: 15px; }
            .footer .icons { font-size: 1.5rem; margin-bottom: 8px; }
            .customer-care { background: #e3f2fd; color: #1976d2; border-radius: 8px; padding: 12px; margin: 18px 0; font-size: 1.1rem; display: flex; align-items: center; gap: 8px; justify-content: center; }
            .thankyou { color: #388e3c; font-size: 1.2rem; margin: 18px 0 0 0; font-weight: bold; }
            .package-features { background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 16px 0; }
            .feature-list { list-style: none; padding: 0; margin: 8px 0; }
            .feature-list li { padding: 4px 0; color: #555; }
            .feature-list li:before { content: "✓ "; color: #4caf50; font-weight: bold; }
            .bonus-features { background: #fff3e0; border-radius: 8px; padding: 16px; margin: 16px 0; }
            .bonus-features h4 { color: #f57c00; margin-bottom: 8px; }
            @media print { .no-print { display: none; } body { background: #fff; } .invoice-container { box-shadow: none; } }
          </style>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <img src="/el7hm-logo.png" alt="Logo" class="logo" />
              <div class="company-info">
                <div><b>الحلم (el7lm) تحت مِيسك القابضة</b> <span style="font-size:1.2em;">🚀</span></div>
                <div>قطر- الدوحة - مركز قطر للمال</div>
                <div>الرقم الضريبي: 02289</div>
                <div>البريد: el7lm@mesk.qa</div>
                <div>هاتف: 97472053188 قطر - 201017799580 مصر</div>
              </div>
            </div>
            <div class="invoice-title">فاتورة اشتراك <span style="font-size:1.3em;">🧾</span></div>
            <div style="margin: 16px 0 24px 0; color:#555;">
              <b>رقم الفاتورة:</b> ${subscription?.invoice_number || ''} &nbsp; | &nbsp;
              <b>تاريخ الإصدار:</b> ${subscription?.payment_date ? new Date(subscription.payment_date).toLocaleDateString('ar-EG') : ''}
            </div>
            <div class="section-title">معلومات العميل <span style="font-size:1.1em;">👤</span></div>
            <table class="details-table">
              <tr><th>الاسم</th><td>${subscription?.customer_name || ''}</td></tr>
              <tr><th>البريد الإلكتروني</th><td>${subscription?.customer_email || ''}</td></tr>
              <tr><th>رقم الهاتف</th><td>${subscription?.customer_phone || ''}</td></tr>
              <tr><th>نوع الحساب</th><td>${subscription?.accountType || 'لاعب'}</td></tr>
              <tr><th>العنوان</th><td>${subscription?.billing_address || '-'}</td></tr>
              <tr><th>الرقم الضريبي</th><td>${subscription?.tax_number || '-'}</td></tr>
            </table>
            <div class="section-title">تفاصيل الاشتراك <span style="font-size:1.1em;">💳</span></div>
            <table class="details-table">
              <tr><th>الباقة</th><td>${subscription?.plan_name || ''}</td></tr>
              <tr><th>المبلغ</th><td>${subscription?.amount || ''} ${subscription?.currencySymbol || subscription?.currency || ''}</td></tr>
              <tr><th>طريقة الدفع</th><td>${subscription?.payment_method === 'bank_transfer' ? 'تحويل بنكي' : 'بطاقة ائتمان/أخرى'}</td></tr>
              <tr><th>رقم العملية</th><td>${subscription?.transaction_id || '-'}</td></tr>
              <tr><th>تاريخ الدفع</th><td>${subscription?.payment_date ? new Date(subscription.payment_date).toLocaleDateString('ar-EG') : ''}</td></tr>
              <tr><th>تاريخ بداية الاشتراك</th><td>${subscription?.start_date ? new Date(subscription.start_date).toLocaleDateString('ar-EG') : ''}</td></tr>
              <tr><th>تاريخ نهاية الاشتراك</th><td>${subscription?.end_date ? new Date(subscription.end_date).toLocaleDateString('ar-EG') : ''}</td></tr>
              <tr><th>تجديد تلقائي</th><td>${subscription?.autoRenew ? 'نعم' : 'لا'}</td></tr>
              <tr><th>حالة الاشتراك</th><td>${getStatusText(subscription?.status || '')}</td></tr>
            </table>
            ${packageInfo ? `
            <div class="section-title">مميزات الباقة <span style="font-size:1.1em;">✨</span></div>
            <div class="package-features">
              <h4>${packageInfo.title} - ${packageInfo.subtitle}</h4>
              <ul class="feature-list">
                ${features.map(feature => `<li>${feature}</li>`).join('')}
              </ul>
            </div>
            ${bonusFeatures.length > 0 ? `
            <div class="bonus-features">
              <h4>🎁 المميزات الإضافية</h4>
              <ul class="feature-list">
                ${bonusFeatures.map(feature => `<li>${feature}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
            ` : ''}
            <div class="customer-care">
              <span style="font-size:1.3em;">🤝</span>
              نحن هنا دائمًا لدعمك! لأي استفسار أو مساعدة لا تتردد في التواصل معنا عبر البريد أو الهاتف.
            </div>
            <div class="summary">
              <span style="font-size:1.2em;">🌟</span>
              <strong>شكراً لاختيارك منصتنا لتحقيق طموحاتك الرياضية!</strong>
              <span style="font-size:1.2em;">🏆</span>
            </div>
            <div class="thankyou">
              <span style="font-size:1.5em;">🎉</span> نتمنى لك رحلة نجاح رائعة معنا! <span style="font-size:1.5em;">🚀</span>
            </div>
            <div class="footer">
              <div class="icons">💙 ⚽ 🏅 🥇 🏆</div>
              منصة الحلم (el7lm) تحت مِيسك القابضة - جميع الحقوق محفوظة &copy; ${new Date().getFullYear()}
              <div style="margin-top:8px; font-size:13px; color:#888;">تم إصدار هذه الفاتورة إلكترونيًا ولا تحتاج إلى توقيع.</div>
              <div style="margin-top:18px; text-align:center;">
                <div style="display:inline-block; border:1px dashed #1976d2; border-radius:8px; padding:12px 24px; background:#f5faff;">
                  <div style="font-size:1.1em; color:#1976d2; font-weight:bold; margin-bottom:4px;">التوقيع الإلكتروني</div>
                  <img src="/signature.png" alt="التوقيع الإلكتروني" style="height:48px; margin-bottom:4px;" onerror="this.style.display='none'" />
                  <div style="font-size:0.95em; color:#555;">تمت الموافقة إلكترونيًا بواسطة إدارة الحلم (el7lm) تحت مِيسك القابضة</div>
                </div>
              </div>
            </div>
            <div class="no-print" style="text-align: center; margin-top: 20px;">
              <button onclick="window.print()" style="background:#1976d2;color:#fff;padding:10px 30px;border:none;border-radius:8px;font-size:1.1rem;cursor:pointer;">طباعة الفاتورة</button>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceContent);
    printWindow.document.close();
    printWindow.focus();
    setPrinting(false);
  };

  const handleDownloadInvoice = () => {
    // نفس منطق الطباعة ولكن للتحميل
    handlePrintInvoice();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">خطأ في تحميل البيانات</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">لا توجد اشتراكات</h2>
          <p className="text-gray-600 mb-4">لم يتم العثور على أي اشتراكات نشطة</p>
          <Link
            href="/dashboard/bulk-payment"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            اشترك الآن
          </Link>
        </div>
      </div>
    );
  }

  const packageInfo = getPackageInfo(subscription.selectedPackage || subscription.plan_name);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          العودة
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">حالة الاشتراك</h1>
        <p className="text-gray-600">عرض تفاصيل اشتراكك الحالي والفواتير</p>
      </div>

      {/* بطاقة حالة الاشتراك */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-full ${getStatusColor(subscription.status)}`}>
              {subscription.status === 'active' && <Check className="w-5 h-5" />}
              {subscription.status === 'pending' && <Clock className="w-5 h-5" />}
              {subscription.status === 'expired' && <AlertCircle className="w-5 h-5" />}
              {subscription.status === 'cancelled' && <X className="w-5 h-5" />}
            </div>
            <div className="ml-3">
              <h2 className="text-xl font-semibold text-gray-900">
                {subscription.plan_name}
              </h2>
              <p className={`text-sm ${getStatusColor(subscription.status)}`}>
                {getStatusText(subscription.status)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {subscription.amount} {subscription.currencySymbol}
            </div>
            <div className="text-sm text-gray-500">
              {subscription.currency}
            </div>
          </div>
        </div>

        {/* تفاصيل الباقة */}
        {packageInfo && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">{packageInfo.icon}</span>
              <h3 className="text-lg font-semibold text-gray-900">{packageInfo.title}</h3>
              {packageInfo.popular && (
                <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  الأكثر شعبية
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-3">{packageInfo.subtitle}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">المميزات الأساسية:</h4>
                <ul className="space-y-1">
                  {packageInfo.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">المميزات الإضافية:</h4>
                <ul className="space-y-1">
                  {packageInfo.bonusFeatures.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <Gift className="w-4 h-4 text-purple-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* تفاصيل الاشتراك */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">تفاصيل الاشتراك</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">تاريخ البداية:</span>
                <span className="font-medium">
                  {subscription.start_date ? new Date(subscription.start_date).toLocaleDateString('ar-EG') : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">تاريخ الانتهاء:</span>
                <span className="font-medium">
                  {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString('ar-EG') : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">طريقة الدفع:</span>
                <span className="font-medium">{subscription.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">رقم العملية:</span>
                <span className="font-medium">{subscription.transaction_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">تجديد تلقائي:</span>
                <span className="font-medium">{subscription.autoRenew ? 'نعم' : 'لا'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">معلومات العميل</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">الاسم:</span>
                <span className="font-medium">{subscription.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">البريد الإلكتروني:</span>
                <span className="font-medium">{subscription.customer_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">رقم الهاتف:</span>
                <span className="font-medium">{subscription.customer_phone || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">نوع الحساب:</span>
                <span className="font-medium">{subscription.accountType || 'لاعب'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* أزرار الطباعة والتحميل */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handlePrintInvoice}
          disabled={printing}
          className="flex-1 flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {printing ? (
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Printer className="w-5 h-5 mr-2" />
          )}
          {printing ? 'جاري الطباعة...' : 'طباعة الفاتورة'}
        </button>
        
        <button
          onClick={handleDownloadInvoice}
          className="flex-1 flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          <Download className="w-5 h-5 mr-2" />
          تحميل الفاتورة
        </button>
      </div>

      {/* رابط للدفع المجمع */}
      <div className="mt-6 text-center">
        <Link
          href="/dashboard/bulk-payment"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          تحديث الاشتراك أو الدفع الجماعي
        </Link>
      </div>
    </div>
  );
}

export default function SubscriptionStatusPage() {
  return <SubscriptionStatusContent />;
} 