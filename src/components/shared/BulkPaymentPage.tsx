// ============================================
// نظام الدفع الجماعي المتطور
// ============================================
// 
// المميزات:
// - دفع جماعي للاعبين مع خصومات
// - باقات مؤسسية مع ميزات VIP
// - المحافظ الإلكترونية (فودافون كاش، اتصالات كاش، أورنج موني)
// - نظام النقاط والمكافآت
// - تقارير وإحصائيات متقدمة
//
// ============================================

'use client';

import React, { useState, useEffect } from 'react';

// إضافة type للمتغير العالمي
declare global {
  interface Window {
    convertedAmountForGeidea?: number;
  }
}
import { Sparkles, Users, Crown, Shield, Star, Gift, Zap, Trophy, CreditCard, Smartphone, Wallet, Check, ArrowLeft, Upload, FileImage, Plus, Search, X, Globe, AlertTriangle, CheckCircle, ExternalLink, Settings, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/lib/firebase/auth-provider';
import Link from 'next/link';
import GeideaPaymentModal from '@/components/GeideaPaymentModal';
import { getCurrencyRates, convertCurrency as convertCurrencyLib, getCurrencyInfo, getRatesAge, forceUpdateRates } from '@/lib/currency-rates';

// إعداد Supabase لرفع الإيصالات في bucket "wallet" - Updated with working credentials
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ekyerljzfokqimbabzxm.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVreWVybGp6Zm9rcWltYmFienhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTcyODMsImV4cCI6MjA2MjIzMzI4M30.Xd6Cg8QUISHyCG-qbgo9HtWUZz6tvqAqG6KKXzuetBY'
);

interface BulkPaymentPageProps {
  accountType: 'club' | 'academy' | 'trainer' | 'agent' | 'player';
}

interface PlayerData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  currentSubscription: {
    status: 'active' | 'expired' | 'none';
    endDate?: Date;
    packageType?: string;
  };
  selected: boolean;
  selectedPackage: string;
}

// باقات الاشتراك العالمية (بالدولار)
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

// سيتم استبدال هذا بالأسعار المحدثة تلقائياً من getCurrencyRates()

// الدول المدعومة مع أعلامها
const SUPPORTED_COUNTRIES = {
  US: { name: 'الولايات المتحدة', currency: 'USD', flag: '🇺🇸' },
  EG: { name: 'مصر', currency: 'EGP', flag: '🇪🇬' }, // خاص - أسعار مصرية
  SA: { name: 'السعودية', currency: 'SAR', flag: '🇸🇦' },
  AE: { name: 'الإمارات', currency: 'AED', flag: '🇦🇪' },
  KW: { name: 'الكويت', currency: 'KWD', flag: '🇰🇼' },
  QA: { name: 'قطر', currency: 'QAR', flag: '🇶🇦' },
  BH: { name: 'البحرين', currency: 'BHD', flag: '🇧🇭' },
  OM: { name: 'عمان', currency: 'OMR', flag: '🇴🇲' },
  JO: { name: 'الأردن', currency: 'JOD', flag: '🇯🇴' },
  LB: { name: 'لبنان', currency: 'LBP', flag: '🇱🇧' },
  TR: { name: 'تركيا', currency: 'TRY', flag: '🇹🇷' },
  GB: { name: 'بريطانيا', currency: 'GBP', flag: '🇬🇧' },
  FR: { name: 'فرنسا', currency: 'EUR', flag: '🇫🇷' },
  DE: { name: 'ألمانيا', currency: 'EUR', flag: '🇩🇪' },
  MA: { name: 'المغرب', currency: 'MAD', flag: '🇲🇦' },
  DZ: { name: 'الجزائر', currency: 'DZD', flag: '🇩🇿' },
  TN: { name: 'تونس', currency: 'TND', flag: '🇹🇳' }
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
    originalPrice: 360,
    period: '12 شهر',
    discount: '50%',
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

// طرق الدفع المحسنة حسب البلد
const PAYMENT_METHODS = {
  // طرق دفع عالمية
  global: [
    { 
      id: 'geidea', 
      name: 'بطاقة بنكية', 
      icon: '💳', 
      description: 'ماستركارد، فيزا، مدى',
      discount: 0,
      popular: true 
    },
    { 
      id: 'paypal', 
      name: 'PayPal', 
      icon: '💙', 
      description: 'دفع آمن عالمياً',
      discount: 0,
      popular: true 
    },
    { 
      id: 'bank_transfer', 
      name: 'تحويل بنكي', 
      icon: '🏦', 
      description: 'خصم 5% إضافي',
      discount: 5,
      popular: false 
    }
  ],
  // طرق دفع مصرية
  EG: [
    { 
      id: 'geidea', 
      name: 'بطاقة بنكية', 
      icon: '💳', 
      description: 'ماستركارد، فيزا، مدى',
      discount: 0,
      popular: true 
    },
    { 
      id: 'vodafone_cash', 
      name: 'فودافون كاش', 
      icon: '📱', 
      description: 'خصم 2% إضافي',
      discount: 2,
      popular: true 
    },
    { 
      id: 'etisalat_cash', 
      name: 'اتصالات كاش', 
      icon: '💰', 
      description: 'خصم 2% إضافي',
      discount: 2,
      popular: false 
    },
    { 
      id: 'instapay', 
      name: 'انستاباي', 
      icon: '⚡', 
      description: 'خصم 3% إضافي',
      discount: 3,
      popular: true 
    },
    { 
      id: 'bank_transfer', 
      name: 'تحويل بنكي', 
      icon: '🏦', 
      description: 'خصم 5% إضافي',
      discount: 5,
      popular: false 
    }
  ],
  // طرق دفع خليجية
  SA: [
    { 
      id: 'geidea', 
      name: 'بطاقة بنكية', 
      icon: '💳', 
      description: 'مدى، فيزا، ماستركارد',
      discount: 0,
      popular: true 
    },
    { 
      id: 'stc_pay', 
      name: 'STC Pay', 
      icon: '📱', 
      description: 'خصم 2% إضافي',
      discount: 2,
      popular: true 
    },
    { 
      id: 'bank_transfer', 
      name: 'تحويل بنكي', 
      icon: '🏦', 
      description: 'خصم 5% إضافي',
      discount: 5,
      popular: false 
    }
  ]
};

export default function BulkPaymentPage({ accountType }: BulkPaymentPageProps) {
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState('subscription_6months');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('geidea');
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [showGeideaModal, setShowGeideaModal] = useState(false);
  
  // متغيرات الدولة والعملة
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [currencyLoading, setCurrencyLoading] = useState(true);

  // نظام أسعار العملات المحدث
  const [currencyRates, setCurrencyRates] = useState<Record<string, any>>({});
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const [lastRatesUpdate, setLastRatesUpdate] = useState<string | null>(null);

  // حالات النماذج
  const [formData, setFormData] = useState({
    transactionId: '',
    senderName: '',
    senderAccount: '',
    receiptFile: null as File | null
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // حالة الطوي والتوسيع للميزات التفصيلية
  const [isFeaturesExpanded, setIsFeaturesExpanded] = useState(false);

  // دالة قراءة بلد المستخدم (محسنة بدون APIs خارجية)
  const detectUserCountry = async () => {
    try {
      setCurrencyLoading(true);
      
      // استخدام Intl API المدمج في المتصفح (آمن ولا يحتاج CORS)
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const locale = navigator.language || 'ar-EG';

      // خريطة المناطق الزمنية للبلدان الرئيسية
      const timezoneCountryMap: Record<string, string> = {
        // البلدان العربية
        'Africa/Cairo': 'EG',
        'Asia/Riyadh': 'SA',
        'Asia/Dubai': 'AE',
        'Asia/Kuwait': 'KW',
        'Asia/Qatar': 'QA',
        'Asia/Bahrain': 'BH',
        'Asia/Baghdad': 'IQ',
        'Asia/Damascus': 'SY',
        'Asia/Beirut': 'LB',
        'Asia/Amman': 'JO',
        'Africa/Tunis': 'TN',
        'Africa/Algiers': 'DZ',
        'Africa/Casablanca': 'MA',
        // بلدان أخرى
        'Europe/London': 'GB',
        'America/New_York': 'US',
        'America/Los_Angeles': 'US',
        'America/Chicago': 'US',
        'Europe/Paris': 'FR',
        'Europe/Berlin': 'DE',
        'Asia/Tokyo': 'JP'
      };

      // محاولة اكتشاف البلد من المنطقة الزمنية
      let detectedCountry = timezoneCountryMap[timezone];
      
      // إذا لم نجد المنطقة الزمنية، حاول من اللغة
      if (!detectedCountry) {
        if (locale.includes('ar') || locale.includes('AR')) {
          detectedCountry = 'EG'; // مصر كافتراضي للعربية
        } else if (locale.startsWith('en-US')) {
          detectedCountry = 'US';
        } else if (locale.startsWith('en-GB')) {
          detectedCountry = 'GB';
        } else if (locale.startsWith('fr')) {
          detectedCountry = 'FR';
        } else if (locale.startsWith('de')) {
          detectedCountry = 'DE';
        } else {
          detectedCountry = 'EG'; // افتراضي للمنطقة العربية
        }
      }

      // التحقق من وجود البلد في قائمة البلدان المدعومة
      if (detectedCountry && SUPPORTED_COUNTRIES[detectedCountry as keyof typeof SUPPORTED_COUNTRIES]) {
        setDetectedCountry(detectedCountry);
        setSelectedCountry(detectedCountry);
        return detectedCountry;
      } else {
        // افتراضي: مصر للمنطقة العربية
        setDetectedCountry('EG');
        setSelectedCountry('EG');
        return 'EG';
      }
    } catch (error) {
      // في حالة أي خطأ، استخدم مصر كافتراضي
      setDetectedCountry('EG');
      setSelectedCountry('EG');
      return 'EG';
    } finally {
      setCurrencyLoading(false);
    }
  };

  // دالة تحويل العملة المحدثة
  const convertCurrency = (amount: number, targetCurrency: string): number => {
    if (targetCurrency === 'USD') return amount;
    
    return convertCurrencyLib(amount, 'USD', targetCurrency, currencyRates);
  };

  // دالة تحميل أسعار العملات
  const loadCurrencyRates = async () => {
    try {
      setRatesLoading(true);
      setRatesError(null);
      
      console.log('🔄 تحميل أسعار العملات...');
      const rates = await getCurrencyRates();
      setCurrencyRates(rates);
      
      const ratesAge = getRatesAge();
      setLastRatesUpdate(ratesAge.lastUpdated);
      
      console.log('✅ تم تحميل أسعار العملات بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تحميل أسعار العملات:', error);
      setRatesError(error instanceof Error ? error.message : 'خطأ في تحميل الأسعار');
    } finally {
      setRatesLoading(false);
    }
  };

  // دالة تحديث قسري للأسعار
  const refreshCurrencyRates = async () => {
    try {
      setRatesLoading(true);
      setRatesError(null);
      
      console.log('🔄 تحديث قسري لأسعار العملات...');
      const rates = await forceUpdateRates();
      setCurrencyRates(rates);
      
      const ratesAge = getRatesAge();
      setLastRatesUpdate(ratesAge.lastUpdated);
      
      console.log('✅ تم تحديث أسعار العملات بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تحديث أسعار العملات:', error);
      setRatesError(error instanceof Error ? error.message : 'خطأ في تحديث الأسعار');
    } finally {
      setRatesLoading(false);
    }
  };

  // دالة الحصول على العملة الحالية
  const getCurrentCurrency = () => {
    const country = SUPPORTED_COUNTRIES[selectedCountry as keyof typeof SUPPORTED_COUNTRIES];
    return country?.currency || 'USD';
  };

  const getCurrentCurrencySymbol = () => {
    const currency = getCurrentCurrency();
    const currencyInfo = getCurrencyInfo(currency, currencyRates);
    return currencyInfo?.symbol || '$';
  };

  // تحميل أسعار العملات عند تحميل المكون
  useEffect(() => {
    loadCurrencyRates();
  }, []);

  // تحديث العملة عند تغيير البلد (إذا كانت الأسعار محملة)
  useEffect(() => {
    if (!ratesLoading && Object.keys(currencyRates).length > 0) {
      detectUserCountry();
    }
  }, [ratesLoading, currencyRates]);

  // دالة رفع الإيصال إلى Supabase
  // دالة رفع الإيصال إلى Supabase bucket "wallet"
  const uploadReceipt = async (file: File, playerName?: string) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      // إنشاء اسم الملف آمن (إزالة الأحرف الخاصة والعربية)
      const fileExtension = file.name.split('.').pop();
      const timestamp = Date.now();
      
      let safeFileName: string;
      if (playerName) {
        // تحويل الاسم العربي إلى نص آمن
        const safeName = playerName
          .replace(/[^\w\s]/g, '') // إزالة الأحرف الخاصة
          .replace(/\s+/g, '_') // تحويل المسافات إلى _
          .toLowerCase(); // تحويل إلى أحرف صغيرة
        
        // إذا كان الاسم فارغ بعد التنظيف، استخدم timestamp
        safeFileName = safeName ? `${safeName}_${timestamp}.${fileExtension}` : `receipt_${timestamp}.${fileExtension}`;
      } else {
        safeFileName = `receipt_${timestamp}.${fileExtension}`;
      }
      
      // المسار: wallet/userId/safeFileName
      const filePath = `${user.uid}/${safeFileName}`;
      console.log(`📁 رفع الإيصال إلى: bucket "wallet" -> ${filePath}`);

      // محاكاة تقدم الرفع
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 80) return prev + 10;
          return prev;
        });
      }, 200);

      // رفع الملف إلى Supabase في bucket "wallet"
      const { data, error } = await supabase.storage
        .from('wallet')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // السماح بالاستبدال إذا كان الملف موجود
        });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) {
        // إذا كان الخطأ أن bucket غير موجود، أعطي رسالة واضحة
        if (error.message.includes('bucket')) {
          throw new Error(`خطأ: تأكد من وجود bucket "wallet" في Supabase Storage. ${error.message}`);
        }
        throw new Error(`خطأ في رفع الإيصال: ${error.message}`);
      }

      // الحصول على رابط الملف العام
      const { data: urlData } = supabase.storage
        .from('wallet')
        .getPublicUrl(filePath);

      console.log(`✅ تم رفع الإيصال بنجاح: ${urlData.publicUrl}`);
      return urlData.publicUrl;

    } catch (error) {
      console.error('❌ خطأ في رفع الإيصال:', error);
      throw error;
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // جلب اللاعبين من Firebase (نفس منطق صفحة إدارة اللاعبين)
  const fetchPlayers = async () => {
    try {
      setLoading(true);
      
      // استخدام Firebase بدلاً من Supabase (مثل صفحة إدارة اللاعبين)
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase/config');
      
             // استخدام معرف المستخدم الحقيقي
       if (!user?.uid) {
         throw new Error('المستخدم غير مصادق');
       }
       
              // البحث حسب نوع الحساب - كل نوع له حقوله الخاصة
       const userId = user.uid;
       
       // تحديد الحقول حسب نوع الحساب
       let field1: string, field2: string;
       switch (accountType) {
         case 'club':
           field1 = 'club_id';
           field2 = 'clubId';
           break;
         case 'academy':
           field1 = 'academy_id';
           field2 = 'academyId';
           break;
         case 'agent':
           field1 = 'agent_id';
           field2 = 'agentId';
           break;
         case 'trainer':
           field1 = 'trainer_id';
           field2 = 'trainerId';
           break;
         case 'player':
           // للاعب: يمكنه دفع اشتراكه الشخصي + أصدقائه (إذا وجدوا)
           field1 = 'user_id';
           field2 = 'playerId';
           break;
         default:
           field1 = 'club_id';
           field2 = 'clubId';
       }
       
       let uniqueDocs: any[] = [];
       
       if (accountType === 'player') {
         // للاعب: جلب ملفه الشخصي من مجموعة users
         const { doc, getDoc } = await import('firebase/firestore');
         const userDoc = await getDoc(doc(db, 'users', userId));
         
         if (userDoc.exists()) {
           const userData = userDoc.data();
           // إنشاء ملف شخصي للاعب نفسه
           const playerProfile = {
             id: userId,
             data: () => ({
               full_name: userData.full_name || userData.displayName || 'ملفي الشخصي',
               email: userData.email,
               phone: userData.phone,
               primary_position: userData.position || userData.primary_position,
               subscription_status: userData.subscription_status,
               subscription_end: userData.subscription_end,
               subscription_type: userData.subscription_type
             })
           };
           uniqueDocs = [playerProfile];
           
           // محاولة جلب أي لاعبين مرتبطين (اختياري)
           try {
             const q1 = query(collection(db, 'players'), where(field1, '==', userId));
             const q2 = query(collection(db, 'players'), where(field2, '==', userId));
             
             const [snapshot1, snapshot2] = await Promise.all([
               getDocs(q1),
               getDocs(q2)
             ]);
             
             const additionalPlayers = [...snapshot1.docs, ...snapshot2.docs];
             uniqueDocs = [...uniqueDocs, ...additionalPlayers];
           } catch (error) {
             console.log('لا توجد لاعبين إضافيين مرتبطين');
           }
         }
       } else {
         // للحسابات الأخرى: المنطق العادي
         const q1 = query(collection(db, 'players'), where(field1, '==', userId));
         const q2 = query(collection(db, 'players'), where(field2, '==', userId));
        
        const [snapshot1, snapshot2] = await Promise.all([
          getDocs(q1),
          getDocs(q2)
        ]);
        
        // ادمج النتائج وتجنب التكرار
        const allDocs = [...snapshot1.docs, ...snapshot2.docs];
        uniqueDocs = allDocs.filter((doc, index, self) => 
          index === self.findIndex(d => d.id === doc.id)
        );
       }
      
      if (uniqueDocs.length > 0) {
        // تحويل البيانات للتنسيق المطلوب
        const formattedPlayers: PlayerData[] = uniqueDocs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.full_name || data.name || data.displayName || 'لاعب',
            email: data.email,
            phone: data.phone,
            position: data.primary_position || data.position,
            currentSubscription: {
              status: data.subscription_status === 'active' ? 'active' : 
                      data.subscription_status === 'expired' ? 'expired' : 'none',
              endDate: data.subscription_end ? new Date(data.subscription_end) : undefined,
              packageType: data.subscription_type
            },
            selected: false,
            selectedPackage: selectedPackage
          };
        });

        setPlayers(formattedPlayers);
      } else {
        // لا توجد لاعبين - في حالة الاعب، إنشاء ملف افتراضي
        if (accountType === 'player') {
          const defaultPlayerProfile: PlayerData = {
            id: userId,
            name: user?.displayName || user?.email?.split('@')[0] || 'ملفي الشخصي',
            email: user?.email || undefined,
            phone: '',
            position: '',
            currentSubscription: {
              status: 'none',
              endDate: undefined,
              packageType: undefined
            },
            selected: false,
            selectedPackage: selectedPackage
          };
          setPlayers([defaultPlayerProfile]);
        } else {
          setPlayers([]);
        }
      }
    } catch (error) {
      // في حالة الخطأ، قائمة فارغة
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };



  // دالة الدفع الجماعي عبر جيديا
  const handleGeideaPayment = () => {
    if (selectedCount === 0) {
      alert('يرجى اختيار لاعب واحد على الأقل للدفع');
      return;
    }

    // التحويل الصحيح: عملة المحلية → USD → EGP (لـ Geidea)
    let convertedAmountEGP: number;
    
    if (currentCurrency === 'EGP') {
      // إذا كانت العملة مصرية، لا حاجة للتحويل
      convertedAmountEGP = Math.round(finalPrice);
      console.log(`💰 [Bulk Payment] مصر - لا حاجة للتحويل: ${finalPrice} ج.م`);
    } else {
      // التحويل المزدوج: العملة المحلية → USD → EGP
      console.log(`🔄 [Bulk Payment] بدء التحويل المزدوج:`);
      console.log(`📋 المبلغ الأصلي: ${finalPrice} ${currency.symbol} (${currentCurrency})`);
      
      // الخطوة 1: تحويل من العملة المحلية إلى USD
      const amountInUSD = convertCurrencyLib(finalPrice, currentCurrency, 'USD', currencyRates);
      console.log(`💵 بالدولار: ${amountInUSD} USD`);
      
      // الخطوة 2: تحويل من USD إلى EGP
      const amountInEGP = convertCurrencyLib(amountInUSD, 'USD', 'EGP', currencyRates);
      convertedAmountEGP = Math.round(amountInEGP);
      
      console.log(`🇪🇬 النتيجة النهائية: ${convertedAmountEGP} ج.م`);
      console.log(`📊 تفاصيل التحويل: ${finalPrice} ${currentCurrency} → ${amountInUSD} USD → ${convertedAmountEGP} EGP`);
      
      // التحقق من صحة التحويل
      const egpRate = getCurrencyInfo('EGP', currencyRates)?.rate;
      const localRate = getCurrencyInfo(currentCurrency, currencyRates)?.rate;
      console.log(`📈 معدلات الصرف - ${currentCurrency}: ${localRate}, EGP: ${egpRate}`);
    }

    // حفظ المبلغ المحول للاستخدام في المودال
    if (typeof window !== 'undefined') {
      window.convertedAmountForGeidea = convertedAmountEGP;
    }
    
    // فتح مودال الدفع
    setShowGeideaModal(true);
  };



  // دالة معالجة فشل الدفع
  const handlePaymentFailure = (error: any) => {
    console.error('❌ فشل الدفع الجماعي:', error);
    alert('فشل في عملية الدفع. يرجى المحاولة مرة أخرى.');
  };

  // تحديث حالة تحديد اللاعب
  const togglePlayerSelection = (playerId: string) => {
    setPlayers(prev => prev.map(player => 
      player.id === playerId 
        ? { ...player, selected: !player.selected }
        : player
    ));
  };

  // تحديد جميع اللاعبين أو إلغاء التحديد
  const toggleSelectAll = () => {
    const allSelected = players.every(p => p.selected);
    setPlayers(prev => prev.map(player => ({ ...player, selected: !allSelected })));
  };

  // تصفية اللاعبين حسب البحث
  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (player.email && player.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // جلب اللاعبين عند تحميل المكون أو تغيير المستخدم
  React.useEffect(() => {
    if (user?.uid) {
      fetchPlayers();
    }
  }, [user?.uid, accountType]);

  // قراءة بلد المستخدم عند تحميل المكون
  React.useEffect(() => {
    detectUserCountry();
  }, []);

  // دالة معالجة تأكيد الدفع
  const handleConfirmPayment = async () => {
    try {
      setUploading(true);

      let receiptUrl = '';
      if (formData.receiptFile) {
        // الحصول على أسماء اللاعبين المختارين لتسمية الملف
        const selectedPlayers = players.filter(p => p.selected);
        let bulkReceiptName = 'bulk_payment_receipt';
        
        if (selectedPlayers.length === 1) {
          // إذا كان لاعب واحد، استخدم اسمه
          bulkReceiptName = selectedPlayers[0]?.name || 'single_player';
        } else if (selectedPlayers.length <= 3) {
          // إذا كان 2-3 لاعبين، استخدم أسماءهم
          bulkReceiptName = selectedPlayers.map(p => p.name).join('_و_');
        } else {
          // إذا كان أكثر من 3 لاعبين، استخدم وصف مجمع
          bulkReceiptName = `دفع_جماعي_${selectedPlayers.length}_لاعب`;
        }
        
        // تنظيف الاسم من الأحرف الخاصة
        bulkReceiptName = bulkReceiptName.replace(/[^a-zA-Z0-9\u0600-\u06FF_]/g, '_');
        
        receiptUrl = await uploadReceipt(formData.receiptFile, bulkReceiptName);
      }

      // حفظ بيانات الدفع في Firebase
      const { collection, addDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase/config');
      
      const paymentData = {
        userId: user?.uid,
        userName: user?.displayName || user?.email || 'غير محدد',
        userEmail: user?.email || 'غير محدد',
        accountType: accountType,
        paymentMethod: 'wallet',
        packageType: selectedPackage,
        amount: finalPrice,
        currency: currentCurrency,
        playerCount: selectedCount,
        transactionId: formData.transactionId,
        senderName: formData.senderName,
        senderAccount: formData.senderAccount,
        receiptUrl: receiptUrl,
        status: 'pending',
        description: `دفع محفظة - ${selectedCount} لاعب - ${selectedPackage}`,
        createdAt: new Date(),
        players: selectedPlayers.map(p => ({ id: p.id, name: p.name })),
        metadata: {
          bulkType: 'wallet_payment',
          playersCount: selectedCount,
          originalAmount: originalTotal,
          discountAmount: totalSavings
        }
      };

      // حفظ في مجموعة bulkPayments في Firebase
      await addDoc(collection(db, 'bulkPayments'), paymentData);

      alert('✅ تم إرسال بيانات الدفع بنجاح! سيتم مراجعتها وتفعيل الاشتراكات خلال 24 ساعة.');
      
      // إعادة تعيين النموذج
      setFormData({
        transactionId: '',
        senderName: '',
        senderAccount: '',
        receiptFile: null
      });

    } catch (error) {
      console.error('خطأ في معالجة الدفع:', error);
      alert('❌ حدث خطأ في إرسال البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setUploading(false);
    }
  };

  // تحديد البيانات حسب البلد المختار
  const selectedCountryData = SUPPORTED_COUNTRIES[selectedCountry as keyof typeof SUPPORTED_COUNTRIES];
  const currentCurrency = selectedCountryData?.currency || 'USD';
  
  // استخدام باقات مصرية خاصة أم الباقات العالمية المحولة
  const packages = selectedCountry === 'EG' ? BULK_PACKAGES_EGP : BULK_PACKAGES_USD;
  
  // معلومات العملة
  const currency = selectedCountry === 'EG' 
    ? { code: 'EGP', symbol: 'ج.م', name: 'جنيه مصري' }
    : getCurrencyInfo(currentCurrency, currencyRates)
      ? { 
          code: currentCurrency, 
          symbol: getCurrencyInfo(currentCurrency, currencyRates)!.symbol,
          name: getCurrencyInfo(currentCurrency, currencyRates)!.name
        }
      : { code: 'USD', symbol: '$', name: 'دولار أمريكي' };
  
  // حساب الأسعار
  const selectedPlayers = players.filter(p => p.selected);
  const selectedCount = selectedPlayers.length;
  const currentPackage = (packages as any)[selectedPackage];
  
  // السعر الأساسي للاشتراك
  let subscriptionPrice = currentPackage?.price || 0;
  let originalSubscriptionPrice = currentPackage?.originalPrice || 0;
  
  // تحويل للعملة المختارة (إلا مصر)
  if (selectedCountry !== 'EG') {
    subscriptionPrice = convertCurrency(subscriptionPrice, currentCurrency);
    originalSubscriptionPrice = convertCurrency(originalSubscriptionPrice, currentCurrency);
  }
  
  // حساب إجمالي للاعبين المختارين
  const subtotal = selectedCount * subscriptionPrice;
  const originalTotal = selectedCount * originalSubscriptionPrice;
  
  // ثوابت الخصم الجماعي
  const MIN_BULK_DISCOUNT_COUNT = 5; // الحد الأدنى للخصم الجماعي
  const isEligibleForBulkDiscount = selectedCount >= MIN_BULK_DISCOUNT_COUNT;
  
  // خصومات الكمية للاشتراكات المتعددة
  let bulkDiscountPercent = 0;
  if (isEligibleForBulkDiscount) {
    if (selectedCount >= 50) bulkDiscountPercent = 15;
    else if (selectedCount >= 20) bulkDiscountPercent = 10;
    else if (selectedCount >= 10) bulkDiscountPercent = 7;
    else if (selectedCount >= 5) bulkDiscountPercent = 5;
  }
  
  const bulkDiscountAmount = (subtotal * bulkDiscountPercent) / 100;
  
  // طرق الدفع المتاحة حسب البلد
  const availablePaymentMethods = PAYMENT_METHODS[selectedCountry as keyof typeof PAYMENT_METHODS] || PAYMENT_METHODS.global;
  
  // خصم طريقة الدفع
  const paymentMethod = availablePaymentMethods.find(m => m.id === selectedPaymentMethod);
  const paymentDiscountAmount = (subtotal * (paymentMethod?.discount || 0)) / 100;
  
  const finalPrice = subtotal - bulkDiscountAmount - paymentDiscountAmount;
  const totalSavings = originalTotal - finalPrice;

  // دالة معالجة نجاح الدفع - defined here after all variables are available
  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      console.log('✅ نجح الدفع الجماعي:', paymentData);
      
      // إعداد بيانات الدفع للحفظ
      const bulkPaymentData = {
        user_id: user?.uid,
        account_type: accountType,
        players: selectedPlayers.map(p => ({
          id: p.id,
          name: p.name,
          package: selectedPackage,
          amount: subscriptionPrice
        })),
        total_amount: finalPrice,
        original_amount: originalTotal,
        discount_amount: totalSavings,
        payment_method: 'geidea',
        payment_status: 'completed',
        transaction_id: paymentData.sessionId || paymentData.transactionId,
        order_id: paymentData.orderId,
        country: selectedCountry,
        currency: currentCurrency,
        exchange_rate: getCurrencyInfo(currentCurrency, currencyRates)?.rate || 1,
        created_at: new Date().toISOString()
      };

      // حفظ بيانات الدفع الجماعي - محاولة حفظ مع معالجة أخطاء محسنة
      let savedSuccessfully = false;
      
      try {
        // التحقق من وجود جدول bulk_payments أولاً
        const { data, error } = await supabase
          .from('bulk_payments')
          .insert([bulkPaymentData])
          .select('*');

        if (!error && data) {
          console.log('✅ تم حفظ البيانات في bulk_payments:', data);
          savedSuccessfully = true;
        } else {
          console.warn('⚠️ خطأ في حفظ البيانات في bulk_payments:', error);
          throw error;
        }
      } catch (bulkError: any) {
        console.warn('⚠️ جدول bulk_payments غير متاح أو محذوف، سيتم استخدام الحل البديل:', bulkError.message);
        // الحل البديل: حفظ في جدول عام أو في localStorage كحد أدنى
        console.log('🔄 محاولة حفظ كنسخة احتياطية...');
        
        try {
          // حفظ في localStorage للاحتفاظ بالبيانات محلياً
          const existingPayments = JSON.parse(localStorage.getItem('bulk_payments_backup') || '[]');
          existingPayments.push(bulkPaymentData);
          localStorage.setItem('bulk_payments_backup', JSON.stringify(existingPayments));
          
          console.log('💾 تم حفظ البيانات محلياً كنسخة احتياطية');
          savedSuccessfully = true;
          
          // إرسال البيانات للكونسول للمتابعة اليدوية
          console.log('📊 بيانات الدفع للمراجعة اليدوية:', bulkPaymentData);
          
        } catch (backupError) {
          console.error('❌ فشل حتى في الحفظ المحلي:', backupError);
        }
      }

      if (savedSuccessfully) {
        alert('🎉 تم الدفع بنجاح! سيتم تفعيل اشتراكات اللاعبين خلال دقائق قليلة.');
        
        // إعادة تعيين التحديدات
        setPlayers(prev => prev.map(player => ({
          ...player,
          selected: false
        })));
      } else {
        throw new Error('فشل في حفظ البيانات');
      }
      
    } catch (error) {
      console.error('خطأ في معالجة الدفع:', error);
      
      // إظهار رسالة مفيدة للمستخدم
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      alert(`تم الدفع بنجاح، لكن حدث خطأ في حفظ البيانات: ${errorMessage}\n\nيرجى الاتصال بالدعم الفني وإعطائهم هذه المعلومات:\nمعرف المعاملة: ${paymentData?.sessionId || paymentData?.transactionId || 'غير متوفر'}`);
    }
  };

  // إعادة تعيين النموذج عند تغيير طريقة الدفع
  const handlePaymentMethodChange = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    setFormData({
      transactionId: '',
      senderName: '',
      senderAccount: '',
      receiptFile: null
    });
  };

  const getPackageColors = (color: string, isSelected: boolean) => {
    const colors = {
      blue: {
        bg: isSelected ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-white hover:bg-blue-50',
        border: isSelected ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-gray-200 hover:border-blue-300',
        text: isSelected ? 'text-white' : 'text-gray-900',
        subtext: isSelected ? 'text-blue-100' : 'text-gray-600',
        badge: 'bg-blue-500'
      },
      purple: {
        bg: isSelected ? 'bg-gradient-to-br from-purple-500 to-purple-600' : 'bg-white hover:bg-purple-50',
        border: isSelected ? 'border-purple-500 ring-4 ring-purple-500/20' : 'border-gray-200 hover:border-purple-300',
        text: isSelected ? 'text-white' : 'text-gray-900',
        subtext: isSelected ? 'text-purple-100' : 'text-gray-600',
        badge: 'bg-purple-500'
      },
      emerald: {
        bg: isSelected ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-white hover:bg-emerald-50',
        border: isSelected ? 'border-emerald-500 ring-4 ring-emerald-500/20' : 'border-gray-200 hover:border-emerald-300',
        text: isSelected ? 'text-white' : 'text-gray-900',
        subtext: isSelected ? 'text-emerald-100' : 'text-gray-600',
        badge: 'bg-emerald-500'
      }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
      {/* Header محسن */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="w-10 h-10 text-yellow-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                إدارة الاشتراكات الذكية
              </h1>
              <Sparkles className="w-10 h-10 text-yellow-500" />
            </div>
            <p className="text-xl text-gray-600 mb-6">
              اشترك واحصل على خصومات حتى <span className="font-bold text-emerald-600">58%</span> • أسعار محلية • دفع جماعي ذكي
            </p>
            <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">
                🏢 {accountType === 'club' ? 'نادي' : 
                    accountType === 'academy' ? 'أكاديمية' : 
                    accountType === 'trainer' ? 'مدرب' : 'وكيل'}
              </div>
              <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-medium">
                👥 {selectedCount} لاعب مختار
              </div>
              <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-medium">
                {selectedCountryData?.flag} {currency.code}
              </div>
            </div>
            
            {/* اختيار الدولة والعملة */}
            <div className="mt-6 max-w-md mx-auto">
              <div className="bg-white rounded-xl shadow-md p-4 border">
                <div className="flex items-center gap-3 mb-3">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">اختر دولتك</h3>
                    <p className="text-xs text-gray-500">
                      {detectedCountry ? `تم اكتشاف: ${SUPPORTED_COUNTRIES[detectedCountry as keyof typeof SUPPORTED_COUNTRIES]?.name}` : 'لتحديد العملة والأسعار'}
                    </p>
                  </div>
                  
                  {/* مؤشر حالة أسعار العملات */}
                  <div className="flex items-center gap-2">
                    {ratesLoading ? (
                      <div className="w-4 h-4 border-t-2 border-blue-600 rounded-full animate-spin"></div>
                    ) : ratesError ? (
                      <div className="text-red-500" title={ratesError}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="text-green-500" title="أسعار محدثة">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    )}
                    
                    {/* زر تحديث الأسعار */}
                    <button
                      onClick={refreshCurrencyRates}
                      disabled={ratesLoading}
                      className="p-1 text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-50"
                      title="تحديث أسعار العملات"
                    >
                      <RefreshCw className={`w-4 h-4 ${ratesLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  
                  {currencyLoading && (
                    <div className="w-4 h-4 border-t-2 border-blue-600 rounded-full animate-spin"></div>
                  )}
                </div>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  disabled={currencyLoading}
                >
                  {Object.entries(SUPPORTED_COUNTRIES).map(([code, country]) => (
                    <option key={code} value={code}>
                      {country.flag} {country.name} ({country.currency})
                    </option>
                  ))}
                </select>
                
                {/* معلومات حالة الأسعار */}
                {!ratesLoading && !ratesError && lastRatesUpdate && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700 font-medium">
                      📊 آخر تحديث للأسعار: {new Date(lastRatesUpdate).toLocaleString('ar-EG')}
                    </p>
                  </div>
                )}
                
                {ratesError && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-700 font-medium">
                      ⚠️ خطأ في تحديث الأسعار - يتم استخدام أسعار افتراضية
                    </p>
                  </div>
                )}
                
                {selectedCountry === 'EG' && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-700 font-medium">
                      🇪🇬 أسعار خاصة بمصر بالجنيه المصري
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* الباقات - 8 أعمدة */}
          <div className="xl:col-span-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                اختر مدة الاشتراك المناسبة
              </h2>
              <p className="text-gray-600 text-center">أسعار تنافسية مع ميزات متطورة لكل فترة</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {Object.entries(packages).map(([key, pkg]) => {
                const isSelected = selectedPackage === key;
                const colors = getPackageColors(pkg.color, isSelected);
                
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedPackage(key)}
                    className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 transform hover:scale-105 ${colors.bg} ${colors.border}`}
                  >
                    {/* شارة الشعبية */}
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                          ⭐ الأكثر شعبية
                        </div>
                      </div>
                    )}

                    {/* علامة الاختيار */}
                    {isSelected && (
                      <div className="absolute top-4 left-4">
                        <div className="bg-white text-green-600 w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-5 h-5" />
                        </div>
                      </div>
                    )}

                    <div className="text-center">
                      {/* الأيقونة */}
                      <div className="text-4xl mb-3">{pkg.icon}</div>
                      
                      {/* العنوان */}
                      <h3 className={`text-xl font-bold mb-1 ${colors.text}`}>
                        {pkg.title}
                      </h3>
                      <p className={`text-sm mb-4 ${colors.subtext}`}>
                        {pkg.subtitle}
                      </p>

                      {/* السعر */}
                      <div className="mb-4">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <span className={`text-3xl font-black ${colors.text}`}>
                            {selectedCountry === 'EG' ? pkg.price : convertCurrency(pkg.price, currentCurrency)} {currency.symbol}
                          </span>
                          <span className={`text-lg line-through ${colors.subtext}`}>
                            {selectedCountry === 'EG' ? pkg.originalPrice : convertCurrency(pkg.originalPrice, currentCurrency)} {currency.symbol}
                          </span>
                        </div>
                        <p className={`text-sm ${colors.subtext}`}>
                          {pkg.period}
                          {selectedCountry !== 'EG' && (
                            <span className="block text-xs opacity-75">
                              (${pkg.price} USD)
                            </span>
                          )}
                        </p>
                      </div>

                      {/* شارة الخصم */}
                      <div className="mb-4">
                        <span className={`${colors.badge} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                          وفر {pkg.discount}
                        </span>
                      </div>

                      {/* مميزات المدة */}
                      <div className={`mb-4 p-3 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-gray-50'}`}>
                        <p className={`text-sm font-medium ${colors.text}`}>
                          ⏳ {pkg.period} - لاعبين غير محدود
                        </p>
                      </div>

                      {/* عرض مختصر للميزات */}
                      <div className={`text-xs ${colors.subtext} text-right space-y-1`}>
                        {pkg.features.slice(0, 3).map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="w-3 h-3 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                        <div className={`font-bold mt-2 ${isSelected ? colors.text : 'text-blue-600'}`}>
                          +{pkg.features.length - 3} ميزة إضافية
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* قسم الميزات التفصيلية */}
            {selectedPackage && (
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                {/* Header قابل للضغط */}
                <div 
                  className="p-6 cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => setIsFeaturesExpanded(!isFeaturesExpanded)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                      <span className="text-2xl">✨</span>
                      <span>ماذا ستحصل عليه مع {(packages as any)[selectedPackage].title}</span>
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 hidden sm:block">
                        {isFeaturesExpanded ? 'إخفاء التفاصيل' : 'عرض جميع الميزات'}
                      </span>
                      <div className={`p-2 rounded-full bg-white shadow-md transition-transform duration-300 ${isFeaturesExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown className="w-5 h-5 text-gray-700" />
                      </div>
                    </div>
                  </div>
                  
                  {/* معلومات مختصرة عندما يكون مطوي */}
                  {!isFeaturesExpanded && (
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-white/70 p-3 rounded-lg">
                        <span className="font-semibold text-blue-700">الميزات الأساسية:</span>
                        <span className="text-gray-600 mr-2">{(packages as any)[selectedPackage].features.length} ميزة</span>
                      </div>
                      <div className="bg-white/70 p-3 rounded-lg">
                        <span className="font-semibold text-purple-700">المكافآت الحصرية:</span>
                        <span className="text-gray-600 mr-2">{(packages as any)[selectedPackage].bonusFeatures.length} مكافأة</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* المحتوى القابل للطوي */}
                <div className={`transition-all duration-500 ease-in-out ${
                  isFeaturesExpanded 
                    ? 'max-h-[2000px] opacity-100' 
                    : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* الميزات الأساسية */}
                      <div className="bg-white rounded-xl p-6 shadow-md">
                        <h4 className="text-xl font-bold text-blue-700 mb-6 flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Star className="w-6 h-6 text-blue-600" />
                          </div>
                          الميزات الأساسية
                        </h4>
                        <div className="space-y-3">
                          {(packages as any)[selectedPackage].features.map((feature: string, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="bg-green-100 p-1 rounded-full mt-0.5">
                                <Check className="w-4 h-4 text-green-600" />
                              </div>
                              <span className="text-slate-700 font-medium flex-1 text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* المكافآت الحصرية */}
                      <div className="bg-white rounded-xl p-6 shadow-md">
                        <h4 className="text-xl font-bold text-purple-700 mb-6 flex items-center gap-3">
                          <div className="bg-purple-100 p-2 rounded-full">
                            <Gift className="w-6 h-6 text-purple-600" />
                          </div>
                          المكافآت الحصرية
                        </h4>
                        <div className="space-y-3">
                          {(packages as any)[selectedPackage].bonusFeatures.map((bonus: string, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg hover:from-yellow-100 hover:to-orange-100 transition-colors">
                              <div className="bg-yellow-100 p-1 rounded-full mt-0.5">
                                <Star className="w-4 h-4 text-yellow-600" />
                              </div>
                              <span className="text-slate-700 font-medium flex-1 text-sm">{bonus}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* رسالة تحفيزية */}
                    <div className="mt-6 text-center p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
                      <h5 className="text-lg font-bold mb-2">🎯 استثمار ذكي في مستقبل مؤسستك</h5>
                      <p className="text-blue-100">احصل على جميع هذه الميزات والمكافآت بسعر مخفض لفترة محدودة</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* الملخص والدفع - 4 أعمدة */}
          <div className="xl:col-span-4 space-y-6">
            {/* إدارة اللاعبين */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  إدارة اللاعبين ({players.length})
                </h3>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/${accountType}/players`}>
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                      title="إدارة اللاعبين"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </Link>
                  <Link href={`/dashboard/${accountType}/players/add`}>
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                      title="إضافة لاعب جديد"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>

              {/* البحث والإجراءات */}
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="البحث بالاسم أو الإيميل..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={toggleSelectAll}
                    className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition-colors"
                  >
                    {players.length > 0 && players.every(p => p.selected) ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                  </button>
                  <div className="text-xs text-gray-500 px-3 py-1">
                    {selectedCount} من {players.length} محدد
                  </div>
                </div>
              </div>

              {/* قائمة اللاعبين */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-t-2 border-blue-600 rounded-full animate-spin"></div>
                    <span className="mr-2 text-gray-600">جاري تحميل اللاعبين...</span>
                  </div>
                ) : filteredPlayers.length === 0 ? (
                  <div className="text-center py-8">
                    {searchTerm ? (
                      <div className="text-gray-500">
                        <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>لم يتم العثور على لاعبين</p>
                        <p className="text-sm mt-1">جرب البحث بكلمة أخرى</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                          <div className="text-center">
                            <Users className="w-12 h-12 mx-auto mb-3 text-blue-500" />
                            <h3 className="text-lg font-bold text-gray-800 mb-2">لا يوجد لاعبين بعد</h3>
                            <p className="text-gray-600 mb-4">ابدأ بإضافة لاعبين للاستفادة من النظام والخصومات الجماعية</p>
                            <div className="space-y-2 text-sm text-left">
                              <div className="bg-white rounded-lg p-3">
                                <p className="font-medium text-blue-800 mb-2">🎯 فوائد إضافة اللاعبين:</p>
                                <div className="space-y-1 text-gray-700">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>خصومات جماعية حتى 15%</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>إدارة مركزية للاشتراكات</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span>تقارير وإحصائيات شاملة</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4">
                              <Link href={`/dashboard/${accountType}/players/add`}>
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto">
                                  <Plus className="w-4 h-4" />
                                  إضافة أول لاعب
                                </button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  filteredPlayers.map((player) => (
                    <div 
                      key={player.id} 
                      className={`p-3 border border-gray-200 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        player.selected ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => togglePlayerSelection(player.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                            player.selected 
                              ? 'bg-blue-600 border-blue-600' 
                              : 'border-gray-300 hover:border-blue-400'
                          }`}>
                            {player.selected && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{player.name}</span>
                            </div>
                            {player.email && (
                              <p className="text-xs text-gray-500 mt-1">{player.email}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                player.currentSubscription.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : player.currentSubscription.status === 'expired'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {player.currentSubscription.status === 'active' ? 'نشط' : 
                                 player.currentSubscription.status === 'expired' ? 'منتهي' : 'بدون اشتراك'}
                              </span>
                              {player.currentSubscription.endDate && (
                                <span className="text-xs text-gray-500">
                                  حتى {player.currentSubscription.endDate.toLocaleDateString('ar-EG')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* ملخص الاختيار */}
              {selectedCount > 0 && (
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">
                        تم اختيار {selectedCount} لاعب
                      </span>
                      <span className="text-sm font-bold text-green-700">
                        {(selectedCount * subscriptionPrice).toLocaleString()} {currency.symbol}
                        {selectedCountry !== 'EG' && (
                          <span className="block text-xs opacity-75">
                            (${(selectedCount * currentPackage.price)} USD)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* تحذير عدم الأهلية للخصم الجماعي */}
                  {!isEligibleForBulkDiscount && (
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="bg-orange-100 p-2 rounded-full mt-0.5">
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-orange-800 mb-2">
                            غير مؤهل للخصم الجماعي
                          </h4>
                          <p className="text-sm text-orange-700 mb-3">
                            تحتاج إلى اختيار <span className="font-bold">{MIN_BULK_DISCOUNT_COUNT} لاعبين على الأقل</span> للحصول على خصم الكمية (5%-15%).
                          </p>
                          <div className="space-y-2 text-sm">
                            <p className="text-orange-800 font-medium">خياراتك المتاحة:</p>
                            <div className="bg-white rounded-lg p-3 space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-gray-700">متابعة الدفع بدون خصم جماعي</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-gray-700">
                                  إضافة {MIN_BULK_DISCOUNT_COUNT - selectedCount} لاعب إضافي للحصول على خصم 5%
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span className="text-gray-700">
                                  إضافة {Math.max(10 - selectedCount, 0)} لاعب للحصول على خصم 7%
                                </span>
                              </div>
                            </div>
                            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                              <p className="text-blue-800 text-xs font-medium">
                                💡 نصيحة: كلما زاد عدد اللاعبين، زاد الخصم! وفر حتى 15% مع 50+ لاعب
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* رسالة تهنئة للخصم الجماعي */}
                  {isEligibleForBulkDiscount && bulkDiscountPercent > 0 && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="bg-green-100 p-2 rounded-full mt-0.5">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-green-800 mb-2">
                            🎉 مؤهل للخصم الجماعي!
                          </h4>
                          <p className="text-sm text-green-700 mb-2">
                            ممتاز! ستحصل على خصم <span className="font-bold">{bulkDiscountPercent}%</span> على إجمالي الطلب
                          </p>
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-sm text-gray-700">
                              وفر <span className="font-bold text-green-600">{bulkDiscountAmount.toLocaleString()} {currency.symbol}</span> مع هذا الخصم
                            </p>
                            {selectedCount < 50 && (
                              <p className="text-xs text-gray-600 mt-1">
                                أضف {50 - selectedCount} لاعب إضافي لوفر 15% (الحد الأقصى)
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* طرق الدفع */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                طريقة الدفع
              </h3>
              <div className="space-y-3">
                {availablePaymentMethods.filter(method => method.popular || selectedPaymentMethod === method.id).map((method) => (
                  <div
                    key={method.id}
                    onClick={() => handlePaymentMethodChange(method.id)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedPaymentMethod === method.id 
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">{method.name}</h4>
                          <p className="text-xs text-gray-500">{method.description}</p>
                        </div>
                      </div>
                      {method.discount > 0 && (
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                          -{method.discount}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ملخص التكلفة */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                <Trophy className="w-6 h-6 text-yellow-500" />
                ملخص التكلفة
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">السعر الأصلي:</span>
                  <span className="line-through text-gray-400 font-medium">
                    {originalTotal.toLocaleString()} {currency.symbol}
                  </span>
                </div>
                <div className="flex justify-between items-center text-green-600">
                  <span>خصم الباقة:</span>
                  <span className="font-bold">-{(originalTotal - subtotal).toLocaleString()} {currency.symbol}</span>
                </div>
                {bulkDiscountPercent > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>خصم الكمية ({bulkDiscountPercent}%):</span>
                    <span className="font-bold">-{bulkDiscountAmount.toLocaleString()} {currency.symbol}</span>
                  </div>
                )}
                {paymentDiscountAmount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>خصم طريقة الدفع:</span>
                    <span className="font-bold">-{paymentDiscountAmount.toLocaleString()} {currency.symbol}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center text-2xl font-bold">
                    <span className="text-gray-800">الإجمالي:</span>
                    <span className="text-blue-600">{finalPrice.toLocaleString()} {currency.symbol}</span>
                  </div>
                  <p className="text-green-600 text-sm mt-2 text-center">
                    💸 وفرت: {totalSavings.toLocaleString()} {currency.symbol}
                  </p>
                </div>
              </div>

              {selectedCount >= 1 ? (
                <div className="mt-6 space-y-4">
                  {/* تنبيه عدم الأهلية للخصم الجماعي */}
                  {selectedCount > 0 && selectedCount < MIN_BULK_DISCOUNT_COUNT && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-full mt-0.5">
                          <AlertTriangle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-blue-800 mb-2">
                            💡 نصيحة للوفر أكثر
                          </h4>
                          <p className="text-sm text-blue-700 mb-2">
                            اختر {MIN_BULK_DISCOUNT_COUNT} لاعبين أو أكثر للحصول على خصم جماعي {5}% إضافي
                          </p>
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-sm text-gray-700">
                              تحتاج إلى <span className="font-bold text-blue-600">{MIN_BULK_DISCOUNT_COUNT - selectedCount}</span> لاعب إضافي للوفر
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* أزرار الدفع حسب الطريقة */}
                  {selectedPaymentMethod === 'geidea' && (
                    <button 
                      onClick={handleGeideaPayment}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <CreditCard className="w-5 h-5" />
                        <span>ادفع بالبطاقة - {finalPrice.toLocaleString()} {currency.symbol}</span>
                      </div>
                      <div className="text-sm opacity-90 mt-1">
                        {isEligibleForBulkDiscount 
                          ? `دفع آمن ومشفر عبر جيديا • خصم ${bulkDiscountPercent}%` 
                          : "دفع آمن ومشفر عبر جيديا"
                        }
                      </div>
                    </button>
                  )}

                  {['vodafone_cash', 'etisalat_cash', 'instapay'].includes(selectedPaymentMethod) && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                          <Smartphone className="w-5 h-5" />
                          تعليمات الدفع - {availablePaymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                        </h4>
                        <div className="text-sm text-blue-700 space-y-2">
                          {selectedPaymentMethod === 'vodafone_cash' && (
                            <>
                              <p>• اتصل بـ *9# واختر الدفع للتجار</p>
                              <p>• أو استخدم تطبيق My Vodafone</p>
                              <p>• رقم التاجر: <span className="font-mono bg-white px-2 py-1 rounded">01017799580</span></p>
                            </>
                          )}
                          {selectedPaymentMethod === 'etisalat_cash' && (
                            <>
                              <p>• اتصل بـ #555* واختر الدفع للتجار</p>
                              <p>• أو استخدم تطبيق etisalat cash</p>
                              <p>• رقم التاجر: <span className="font-mono bg-white px-2 py-1 rounded">01017799580</span></p>
                            </>
                          )}
                          {selectedPaymentMethod === 'instapay' && (
                            <>
                              <p>• افتح تطبيق البنك الخاص بك</p>
                              <p>• اختر InstaPay من القائمة</p>
                              <p>• رقم المحفظة: <span className="font-mono bg-white px-2 py-1 rounded">01017799580</span></p>
                              <p>• اسم المستفيد: <span className="font-mono bg-white px-2 py-1 rounded">منصة النادي</span></p>
                            </>
                          )}
                          <p className="font-bold">• المبلغ: <span className="text-lg">{finalPrice.toLocaleString()} {currency.symbol}</span></p>
                        </div>
                      </div>

                      {/* نموذج رفع الإيصال */}
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <h5 className="font-bold text-gray-800 mb-3">📄 رفع إيصال الدفع</h5>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              رقم العملية / المرجع
                            </label>
                            <input
                              type="text"
                              value={formData.transactionId}
                              onChange={(e) => setFormData(prev => ({ ...prev, transactionId: e.target.value }))}
                              placeholder="أدخل رقم العملية من الإيصال"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              رفع صورة الإيصال
                            </label>
                            <p className="text-xs text-gray-500 mb-2">
                              💡 سيتم حفظ الإيصال في: Supabase/wallet/معرف_المستخدم/اسم_اللاعب.jpg
                            </p>
                            <div className="space-y-2">
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => setFormData(prev => ({ ...prev, receiptFile: e.target.files?.[0] || null }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                              {formData.receiptFile && (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                  <FileImage className="w-4 h-4" />
                                  <span>{formData.receiptFile.name}</span>
                                </div>
                              )}
                              {uploading && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs text-gray-600">
                                    <span>جاري الرفع...</span>
                                    <span>{Math.round(uploadProgress)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={handleConfirmPayment}
                            disabled={uploading || !formData.transactionId || !formData.receiptFile}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
                          >
                            {uploading ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
                                جاري المعالجة...
                              </div>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 inline mr-2" />
                                تأكيد الدفع ورفع الإيصال
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === 'bank_transfer' && (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                          <Wallet className="w-5 h-5" />
                          بيانات التحويل البنكي
                        </h4>
                        <div className="text-sm text-green-700 space-y-2">
                          <p>• اسم البنك: <span className="font-mono bg-white px-2 py-1 rounded">البنك الأهلي المصري</span></p>
                          <p>• رقم الحساب: <span className="font-mono bg-white px-2 py-1 rounded">1234567890123456</span></p>
                          <p>• اسم المستفيد: <span className="font-mono bg-white px-2 py-1 rounded">شركة منصة النادي</span></p>
                          <p>• الرقم القومي: <span className="font-mono bg-white px-2 py-1 rounded">12345678901234</span></p>
                          <p className="font-bold">• المبلغ: <span className="text-lg">{finalPrice.toLocaleString()} {currency.symbol}</span></p>
                        </div>
                      </div>

                      {/* نموذج بيانات التحويل */}
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <h5 className="font-bold text-gray-800 mb-3">🏦 بيانات التحويل</h5>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                اسم المحول
                              </label>
                              <input
                                type="text"
                                value={formData.senderName}
                                onChange={(e) => setFormData(prev => ({ ...prev, senderName: e.target.value }))}
                                placeholder="اسم المحول"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                رقم الحساب المحول منه
                              </label>
                              <input
                                type="text"
                                value={formData.senderAccount}
                                onChange={(e) => setFormData(prev => ({ ...prev, senderAccount: e.target.value }))}
                                placeholder="رقم الحساب"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              رقم العملية
                            </label>
                            <input
                              type="text"
                              value={formData.transactionId}
                              onChange={(e) => setFormData(prev => ({ ...prev, transactionId: e.target.value }))}
                              placeholder="رقم العملية من إيصال التحويل"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              رفع إيصال التحويل
                            </label>
                            <p className="text-xs text-gray-500 mb-2">
                              💡 سيتم حفظ الإيصال في: Supabase/wallet/معرف_المستخدم/دفع_جماعي_N_لاعب.jpg
                            </p>
                            <div className="space-y-2">
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => setFormData(prev => ({ ...prev, receiptFile: e.target.files?.[0] || null }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                              {formData.receiptFile && (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                  <FileImage className="w-4 h-4" />
                                  <span>{formData.receiptFile.name}</span>
                                </div>
                              )}
                              {uploading && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs text-gray-600">
                                    <span>جاري الرفع...</span>
                                    <span>{Math.round(uploadProgress)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={handleConfirmPayment}
                            disabled={uploading || !formData.transactionId || !formData.receiptFile || !formData.senderName}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
                          >
                            {uploading ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
                                جاري المعالجة...
                              </div>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 inline mr-2" />
                                إرسال بيانات التحويل
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-6 p-6 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl">
                  <div className="text-center">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-orange-500" />
                    <h4 className="text-lg font-bold text-orange-800 mb-2">لا يمكن المتابعة</h4>
                    <p className="text-orange-700 mb-4">
                      يرجى اختيار لاعب واحد على الأقل لإتمام عملية الدفع
                    </p>
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-700 mb-2">للمتابعة قم بـ:</p>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>اختيار لاعب موجود من القائمة</span>
                        </div>
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>أو إضافة لاعب جديد</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link href={`/dashboard/${accountType}/players`}>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          إدارة اللاعبين
                        </button>
                      </Link>
                      <Link href={`/dashboard/${accountType}/players/add`}>
                        <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          إضافة لاعب الآن
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>



      {/* Modal الدفع عبر جيديا */}
              <GeideaPaymentModal
          visible={showGeideaModal}
          onRequestClose={() => setShowGeideaModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentFailure={handlePaymentFailure}
          amount={typeof window !== 'undefined' && window.convertedAmountForGeidea ? window.convertedAmountForGeidea : Math.round(finalPrice)} // استخدام المبلغ المحول الصحيح
                  currency="EGP"
          title="اشتراكات اللاعبين"
          description={`تجديد اشتراكات ${selectedCount} لاعب بإجمالي ${finalPrice.toLocaleString()} ${currency.symbol}`}
        customerEmail={user?.email || 'customer@example.com'}
        merchantReferenceId={`BULK${Date.now()}`}
      />
    </div>
  );
}

 
