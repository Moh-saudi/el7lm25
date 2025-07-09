'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/lib/firebase/auth-provider';


import { useRouter } from 'next/navigation';

// Define user role types
type UserRole = 'player' | 'club' | 'academy' | 'agent' | 'trainer' | 'admin';
import { useState, useEffect, useRef } from 'react';

import {
  AlertTriangle,
  Check,
  CheckCircle,
  Eye,
  EyeOff,
  Home,
  Loader2,
  Lock,
  Phone,
  Shield,
  Star,
  User,
  UserCheck,
  Users,
  X
} from 'lucide-react';

import UnifiedOTPVerification from '@/components/shared/UnifiedOTPVerification';

// قائمة الدول مع أكوادها والعملات وأطوال أرقام الهاتف
const countries = [
  { name: 'السعودية', code: '+966', currency: 'SAR', currencySymbol: 'ر.س', phoneLength: 9, phonePattern: '[0-9]{9}' },
  { name: 'الإمارات', code: '+971', currency: 'AED', currencySymbol: 'د.إ', phoneLength: 9, phonePattern: '[0-9]{9}' },
  { name: 'الكويت', code: '+965', currency: 'KWD', currencySymbol: 'د.ك', phoneLength: 8, phonePattern: '[0-9]{8}' },
  { name: 'قطر', code: '+974', currency: 'QAR', currencySymbol: 'ر.ق', phoneLength: 8, phonePattern: '[0-9]{8}' },
  { name: 'البحرين', code: '+973', currency: 'BHD', currencySymbol: 'د.ب', phoneLength: 8, phonePattern: '[0-9]{8}' },
  { name: 'عمان', code: '+968', currency: 'OMR', currencySymbol: 'ر.ع', phoneLength: 8, phonePattern: '[0-9]{8}' },
  { name: 'مصر', code: '+20', currency: 'EGP', currencySymbol: 'ج.م', phoneLength: 10, phonePattern: '[0-9]{10}' },
  { name: 'الأردن', code: '+962', currency: 'JOD', currencySymbol: 'د.أ', phoneLength: 9, phonePattern: '[0-9]{9}' },
  { name: 'لبنان', code: '+961', currency: 'LBP', currencySymbol: 'ل.ل', phoneLength: 8, phonePattern: '[0-9]{8}' },
  { name: 'العراق', code: '+964', currency: 'IQD', currencySymbol: 'د.ع', phoneLength: 10, phonePattern: '[0-9]{10}' },
  { name: 'سوريا', code: '+963', currency: 'SYP', currencySymbol: 'ل.س', phoneLength: 9, phonePattern: '[0-9]{9}' },
  { name: 'المغرب', code: '+212', currency: 'MAD', currencySymbol: 'د.م', phoneLength: 9, phonePattern: '[0-9]{9}' },
  { name: 'الجزائر', code: '+213', currency: 'DZD', currencySymbol: 'د.ج', phoneLength: 9, phonePattern: '[0-9]{9}' },
  { name: 'تونس', code: '+216', currency: 'TND', currencySymbol: 'د.ت', phoneLength: 8, phonePattern: '[0-9]{8}' },
  { name: 'ليبيا', code: '+218', currency: 'LYD', currencySymbol: 'د.ل', phoneLength: 9, phonePattern: '[0-9]{9}' },
];

// دالة للحصول على مسار لوحة التحكم حسب نوع الحساب
const getDashboardRoute = (accountType: string) => {
  switch (accountType) {
    case 'player': return '/dashboard/player';
    case 'club': return '/dashboard/club';
    case 'agent': return '/dashboard/agent';
    case 'academy': return '/dashboard/academy';
    case 'trainer': return '/dashboard/trainer';
    case 'marketer': return '/dashboard/marketer';
    default: return '/dashboard';
  }
};

// دالة للتحقق من صحة تنسيق البريد الإلكتروني فقط
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

function normalizePhone(countryCode: string, phone: string) {
  // إزالة أي صفر في بداية الرقم المحلي
  let local = phone.replace(/^0+/, '');
  // إزالة أي رموز أو فراغات
  local = local.replace(/\D/g, '');
  // دمج كود الدولة مع الرقم المحلي (بدون +)
  return `${countryCode.replace(/\D/g, '')}${local}`;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, loginWithGoogle, userData } = useAuth();
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    accountType: '',
    name: '',
    agreeToTerms: false,
    country: '',
    countryCode: '',
    currency: '',
    currencySymbol: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | React.ReactNode>('');
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [pendingRegistrationData, setPendingRegistrationData] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [phoneCheckLoading, setPhoneCheckLoading] = useState(false);
  const [phoneExistsError, setPhoneExistsError] = useState('');
  const phoneCheckRef = useRef(false);
  const phoneCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const accountTypes = [
    { value: 'player', label: 'لاعب', icon: Star },
    { value: 'club', label: 'نادي', icon: Home },
    { value: 'agent', label: 'وكيل لاعبين', icon: UserCheck },
    { value: 'academy', label: 'أكاديمية', icon: Users },
    { value: 'trainer', label: 'مدرب', icon: User },
    { value: 'marketer', label: 'مسوق لاعبين', icon: Users }
  ];

  // عند تحميل الصفحة: تحقق من وجود رقم هاتف معلق في localStorage
  useEffect(() => {
    const storedPendingPhone = localStorage.getItem('pendingPhoneVerification');
    if (storedPendingPhone) {
      setPendingPhone(storedPendingPhone);
      setShowPhoneVerification(true);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    
    // إذا كان الحقل هو رقم الهاتف، نتأكد من أنه يحتوي فقط على أرقام
    if (name === 'phone') {
      const numbersOnly = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numbersOnly
      }));
      
      // التحقق من تكرار رقم الهاتف أثناء الكتابة
      handlePhoneValidation(numbersOnly);
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // دالة التحقق من تكرار رقم الهاتف أثناء الكتابة
  const handlePhoneValidation = async (phoneNumber: string) => {
    // إلغاء التحقق السابق إذا كان موجوداً
    if (phoneCheckTimeoutRef.current) {
      clearTimeout(phoneCheckTimeoutRef.current);
    }

    // مسح رسالة الخطأ السابقة
    setPhoneExistsError('');

    // التحقق من أن الرقم ليس فارغاً أو قصيراً جداً
    if (!phoneNumber || phoneNumber.length < 6) {
      return;
    }

    // التحقق من صحة تنسيق الرقم حسب الدولة
    const country = countries.find(c => c.name === formData.country);
    if (country) {
      const phoneRegex = new RegExp(country.phonePattern);
      if (!phoneRegex.test(phoneNumber)) {
        return;
      }
    } else {
      if (!/^[0-9]{8,10}$/.test(phoneNumber)) {
        return;
      }
    }

    // تأخير التحقق لمدة 500 مللي ثانية لتجنب الطلبات المتكررة
    phoneCheckTimeoutRef.current = setTimeout(async () => {
      // منع الاستدعاءات المتكررة
      if (phoneCheckRef.current || phoneCheckLoading) return;
      
      phoneCheckRef.current = true;
      setPhoneCheckLoading(true);
      
      try {
        const fullPhoneNumber = normalizePhone(formData.countryCode, phoneNumber);
        console.log('🔍 Checking phone number:', {
          originalPhone: phoneNumber,
          countryCode: formData.countryCode,
          fullPhoneNumber
        });
        
        const checkRes = await fetch('/api/auth/check-user-exists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: fullPhoneNumber || undefined,
          }),
        });
        const checkData = await checkRes.json();
        console.log('📊 Check result:', checkData);
        
        if (checkData.phoneExists) {
          setPhoneExistsError('رقم الهاتف مستخدم بالفعل. يرجى استخدام رقم آخر أو تسجيل الدخول.');
        }
      } catch (e) {
        console.error('❌ Phone check error:', e);
        setPhoneExistsError('تعذر التحقق من رقم الهاتف. حاول لاحقًا.');
      } finally {
        setPhoneCheckLoading(false);
        phoneCheckRef.current = false;
      }
    }, 500);
  };

  // دالة لتحديث الدولة المختارة
  const handleCountryChange = (countryName: string) => {
    const country = countries.find(c => c.name === countryName);
    setSelectedCountry(country);
    
    // مسح رسالة الخطأ ورقم الهاتف عند تغيير الدولة
    setPhoneExistsError('');
    if (phoneCheckTimeoutRef.current) {
      clearTimeout(phoneCheckTimeoutRef.current);
    }
    
    setFormData(prev => ({
      ...prev,
      country: countryName,
      countryCode: country?.code || '',
      currency: country?.currency || '',
      currencySymbol: country?.currencySymbol || '',
      phone: '' // مسح رقم الهاتف عند تغيير الدولة
    }));
  };

  // دالة التحقق الفوري من رقم الهاتف عند الخروج من الحقل
  const handlePhoneBlur = async () => {
    // التحقق من أن الرقم مكتمل وصحيح
    const country = countries.find(c => c.name === formData.country);
    if (!formData.phone.trim()) return;
    if (country) {
      const phoneRegex = new RegExp(country.phonePattern);
      if (!phoneRegex.test(formData.phone)) return;
    } else {
      if (!/^[0-9]{8,10}$/.test(formData.phone)) return;
    }
    
    // إذا كان التحقق جارياً بالفعل، لا نحتاج للتحقق مرة أخرى
    if (phoneCheckRef.current || phoneCheckLoading) return;
    
    // التحقق من تكرار الرقم إذا لم يتم التحقق منه بعد
    if (!phoneExistsError && formData.phone.length >= 6) {
      handlePhoneValidation(formData.phone);
    }
  };

  const validateForm = () => {
    // التحقق من الاسم
    if (!formData.name.trim()) {
      setError('يرجى إدخال الاسم الكامل');
      return false;
    }

    // التحقق من الدولة
    if (!formData.country) {
      setError('يرجى اختيار الدولة');
      return false;
    }

    // التحقق من رقم الهاتف
    if (!formData.phone.trim()) {
      setError('يرجى إدخال رقم الهاتف');
      return false;
    }

    // التحقق من صحة تنسيق رقم الهاتف حسب الدولة
    const country = countries.find(c => c.name === formData.country);
    if (country) {
      const phoneRegex = new RegExp(country.phonePattern);
      if (!phoneRegex.test(formData.phone)) {
        setError(`يرجى إدخال رقم هاتف صحيح مكون من ${country.phoneLength} أرقام للدولة ${country.name}`);
        return false;
      }
    } else {
      // التحقق عام إذا لم يتم اختيار دولة
      if (!/^[0-9]{8,10}$/.test(formData.phone)) {
        setError('يرجى إدخال رقم هاتف صحيح مكون من 8-10 أرقام');
        return false;
      }
    }

    // التحقق من كلمة المرور
    if (formData.password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return false;
    }

    if (!formData.accountType) {
      setError('يرجى اختيار نوع الحساب');
      return false;
    }

    if (!formData.agreeToTerms) {
      setError('يجب الموافقة على الشروط والأحكام');
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    // منع التسجيل المتكرر
    if (loading || showPhoneVerification) {
      console.log('🛑 Registration blocked - already loading or OTP modal open');
      return;
    }

    console.log('🚀 Starting registration process...');
    setLoading(true);
    try {
      // تحقق من وجود المستخدم مسبقاً (برقم الهاتف فقط)
      const fullPhoneNumber = normalizePhone(formData.countryCode, formData.phone);
      console.log('🔍 Final check before registration:', {
        phone: formData.phone,
        countryCode: formData.countryCode,
        fullPhoneNumber
      });
      
      const checkRes = await fetch('/api/auth/check-user-exists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullPhoneNumber || undefined,
        }),
      });
      const checkData = await checkRes.json();
      console.log('📊 Final check result:', checkData);
      
      if (checkData.phoneExists) {
        setError('رقم الهاتف مستخدم بالفعل. يرجى استخدام رقم آخر أو تسجيل الدخول.');
        setLoading(false);
        return;
      }

      // إذا الرقم غير مستخدم، أظهر نافذة OTP وأرسل الكود
      const selectedCountry = countries.find(c => c.name === formData.country);
      const registrationData = {
        full_name: formData.name,
        phone: formData.phone,
        country: formData.country,
        countryCode: formData.countryCode,
        currency: selectedCountry?.currency || 'USD',
        currencySymbol: selectedCountry?.currencySymbol || '$'
      };
      
      console.log('📞 Setting up OTP verification for:', fullPhoneNumber);
      
      // التحقق من أن رقم الهاتف لم يتغير
      if (pendingPhone === fullPhoneNumber && showPhoneVerification) {
        console.log('🛑 OTP verification already open for this phone number');
        setLoading(false);
        return;
      }
      
      // حفظ البيانات المعلقة وعرض التحقق من رقم الهاتف
      setPendingRegistrationData(registrationData);
      setPendingPhone(fullPhoneNumber);
      setShowPhoneVerification(true);
      localStorage.setItem('pendingPhoneVerification', fullPhoneNumber);
      
    } catch (error: unknown) {
      console.error('❌ Registration error:', error);
      if (error instanceof Error) {
        setError(error.message || 'حدث خطأ أثناء التسجيل.');
      } else {
        setError('حدث خطأ أثناء التسجيل.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerificationSuccess = async (verifiedPhone: string) => {
    // منع المعالجة المتكررة
    if (loading) {
      console.log('🛑 Phone verification success blocked - already processing');
      return;
    }

    // أغلق نافذة التحقق فوراً بعد النجاح
    setShowPhoneVerification(false);
    setPendingPhone(null);
    localStorage.removeItem('pendingPhoneVerification');
    setError('');
    setLoading(true);
    try {
      // التأكد من وجود بيانات التسجيل المعلقة
      if (!pendingRegistrationData) {
        throw new Error('بيانات التسجيل غير متوفرة. يرجى المحاولة مرة أخرى.');
      }
      
      // توليد بريد إلكتروني مؤقت آمن لـ Firebase
      let firebaseEmail = '';
      const cleanPhone = (formData.phone || '').replace(/[^0-9]/g, '');
      const cleanCountryCode = (formData.countryCode || '').replace(/[^0-9]/g, '');
      const normalizedPhone = normalizePhone(formData.countryCode, formData.phone);
      
      // التأكد من وجود البيانات المطلوبة
      if (!cleanPhone || !cleanCountryCode) {
        throw new Error('بيانات رقم الهاتف غير مكتملة');
      }
      
      // إنشاء بريد إلكتروني آمن وفريد
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      firebaseEmail = `user_${cleanCountryCode}_${cleanPhone}_${timestamp}_${randomSuffix}@el7hm.com`;
      
      // التحقق من صحة البريد الإلكتروني
      if (!isValidEmail(firebaseEmail)) {
        console.error('❌ Invalid email format:', firebaseEmail);
        throw new Error('البريد الإلكتروني المُنشأ غير صالح');
      }
      
      console.log('✅ Email validation passed:', firebaseEmail);
      
      // التأكد من اختيار نوع الحساب
      if (!formData.accountType) {
        throw new Error('يرجى اختيار نوع الحساب');
      }
      
      console.log('📧 Using Firebase email:', firebaseEmail);
      console.log('📱 Phone data:', { 
        originalPhone: formData.phone, 
        cleanPhone, 
        countryCode: formData.countryCode, 
        cleanCountryCode,
        verifiedPhone 
      });
      
      // طباعة البيانات المرسلة إلى Firebase
      console.log('Trying to register with:', { 
        email: firebaseEmail, 
        password: formData.password, 
        accountType: formData.accountType, 
        extra: { 
          ...pendingRegistrationData, 
          phone: verifiedPhone, 
          originalEmail: formData.phone.trim() || null, 
          firebaseEmail 
        } 
      });
      
      // إكمال عملية التسجيل بعد التحقق من رقم الهاتف
      const userData = await registerUser(
        firebaseEmail,
        formData.password, 
        formData.accountType as UserRole,
        {
          ...pendingRegistrationData,
          phone: verifiedPhone,
          originalEmail: formData.phone.trim() || null, // حفظ البريد الأصلي إذا كان موجوداً
          firebaseEmail: firebaseEmail // حفظ البريد المستخدم في Firebase
        }
      );
      console.log('✅ Registration successful:', userData);
      const otpMethod = formData.country === 'مصر' ? 'SMS' : 'WhatsApp';
      setMessage(`✅ تم التحقق من رقم الهاتف بنجاح عبر ${otpMethod}! سيتم تحويلك للوحة التحكم.`);
      setTimeout(() => {
        const dashboardRoute = getDashboardRoute(formData.accountType);
        router.replace(dashboardRoute);
      }, 2000);
    } catch (error: unknown) {
      console.error('❌ Registration failed:', error);
      if (error instanceof Error) {
        // طباعة رسالة الخطأ التفصيلية من Firebase إذا وجدت
        if ((error as any).code) {
          console.error('Firebase error code:', (error as any).code);
        }
        if ((error as any).message) {
          console.error('Firebase error message:', (error as any).message);
        }
        if (error.message.includes('auth/email-already-in-use')) {
          setError(
            <div className="space-y-3">
              <p>البريد الإلكتروني مستخدم بالفعل. لديك حساب موجود.</p>
              <p className="text-sm text-gray-600">يمكنك تسجيل الدخول بحسابك الموجود أو استخدام بريد إلكتروني آخر.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => {
                    setError('');
                    setShowPhoneVerification(false);
                    setPendingPhone(null);
                    localStorage.removeItem('pendingPhoneVerification');
                    setFormData(prev => ({ ...prev, phone: '' }));
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
                >
                  استخدام بريد آخر
                </button>
              </div>
            </div>
          );
        } else if (error.message.includes('auth/operation-not-allowed')) {
          setError(
            <div className="space-y-3">
              <p>تسجيل الحسابات غير مفعل في النظام.</p>
              <p className="text-sm text-gray-600">يرجى التواصل مع الدعم الفني.</p>
              <a 
                href="/test-firebase-diagnosis" 
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                فحص إعدادات Firebase
              </a>
            </div>
          );
        } else if (error.message.includes('auth/network-request-failed')) {
          setError('مشكلة في الاتصال بالإنترنت. يرجى التحقق من الاتصال والمحاولة مرة أخرى.');
        } else if (error.message.includes('Invalid email format')) {
          setError('البريد الإلكتروني المُنشأ غير صالح. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.');
        } else if (error.message.includes('بيانات رقم الهاتف غير مكتملة')) {
          setError('بيانات رقم الهاتف غير مكتملة. يرجى التأكد من اختيار الدولة وإدخال رقم الهاتف الصحيح.');
        } else if (error.message.includes('auth/weak-password')) {
          setError('كلمة المرور ضعيفة جداً. يجب أن تكون 8 أحرف على الأقل.');
        } else if (error.message.includes('auth/invalid-email')) {
          setError('البريد الإلكتروني غير صالح. يرجى المحاولة مرة أخرى.');
        } else if (error.message.includes('بيانات التسجيل غير متوفرة')) {
          setError('بيانات التسجيل غير متوفرة. يرجى المحاولة مرة أخرى من البداية.');
        } else if (error.message.includes('يرجى اختيار نوع الحساب')) {
          setError('يرجى اختيار نوع الحساب قبل المتابعة.');
        } else {
          setError(error.message || 'حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.');
        }
      } else {
        setError('حدث خطأ غير متوقع أثناء التسجيل.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerificationFailed = (error: string) => {
    console.log('❌ Phone verification failed:', error);
    
    // إذا كان الخطأ يتعلق بـ WhatsApp، نعرض رسالة خاصة
    if (error.includes('WhatsApp') || error.includes('whatsapp')) {
      setError(`فشل في إرسال رمز التحقق عبر WhatsApp: ${error}. يرجى التأكد من إعدادات WhatsApp أو التواصل مع الدعم الفني.`);
    } else {
      setError(error);
    }
    
    setShowPhoneVerification(false);
    setPendingPhone(null);
    localStorage.removeItem('pendingPhoneVerification');
  };

  const handlePhoneVerificationClose = () => {
    console.log('🔒 Closing OTP verification modal');
    setShowPhoneVerification(false);
    setPendingPhone(null);
    localStorage.removeItem('pendingPhoneVerification');
    setError('تم إلغاء التحقق من رقم الهاتف.');
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-600 to-purple-700" dir="rtl">
        <div className="w-full max-w-xl overflow-hidden bg-white shadow-2xl rounded-xl">
          {/* Header Section */}
          <div className="p-6 text-center text-white bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="flex justify-center mb-4">
              <Shield className="w-12 h-12" />
            </div>
            <h1 className="mb-2 text-3xl font-bold">إنشاء حساب جديد</h1>
            <p className="text-blue-100">انضم إلى مجتمعنا الرياضي عبر التحقق من رقم الهاتف</p>
          </div>

          <form onSubmit={handleRegister} className="p-8 space-y-6">
            {/* Error and Success Messages */}
            {error && (
              <div className="flex items-start gap-2 p-4 text-red-700 rounded-lg bg-red-50">
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  {typeof error === 'string' ? <p>{error}</p> : error}
                </div>
              </div>
            )}
            {message && (
              <div className="flex items-center gap-2 p-4 text-green-700 rounded-lg bg-green-50">
                <CheckCircle className="w-5 h-5" />
                <p>{message}</p>
              </div>
            )}

            {/* Account Type Selection */}
            <div className="grid grid-cols-3 gap-4">
              {accountTypes.map(({ value, label, icon: Icon }) => (
                <label
                  key={value}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg cursor-pointer border-2 transition-all text-center ${
                    formData.accountType === value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="accountType"
                    value={value}
                    checked={formData.accountType === value}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <Icon className={`h-6 w-6 ${formData.accountType === value ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${formData.accountType === value ? 'text-blue-700' : 'text-gray-600'}`}>{label}</span>
                </label>
              ))}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Full Name Input */}
              <div>
                <label className="block mb-2 text-gray-700">الاسم الكامل</label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full py-3 pl-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل اسمك الكامل"
                    required
                    maxLength={50}
                  />
                  <User className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                </div>
              </div>

              {/* Country Selection */}
              <div>
                <label className="block mb-2 text-gray-700">الدولة</label>
                <div className="relative">
                  <select
                    name="country"
                    value={formData.country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full py-3 pl-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">اختر الدولة</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.name}>
                        {country.name} ({country.code}) - {country.phoneLength} أرقام
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone Input */}
              <div>
                <label className="block mb-2 text-gray-700">
                  رقم الهاتف
                  {selectedCountry && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({selectedCountry.phoneLength} أرقام)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <div className="flex">
                    <div className="flex items-center px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50">
                      {formData.countryCode || '+966'}
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onBlur={handlePhoneBlur}
                      className={`w-full py-3 pl-12 pr-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        phoneExistsError 
                          ? 'border-red-300 focus:ring-red-500' 
                          : phoneCheckLoading 
                            ? 'border-blue-300 focus:ring-blue-500'
                            : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder={selectedCountry ? `${selectedCountry.phoneLength} أرقام` : "رقم الهاتف"}
                      required
                      pattern={selectedCountry?.phonePattern}
                      maxLength={selectedCountry?.phoneLength || 10}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {phoneCheckLoading ? (
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                      ) : phoneExistsError ? (
                        <X className="w-4 h-4 text-red-500" />
                      ) : formData.phone.length >= 6 && !phoneExistsError ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Phone className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  {selectedCountry && (
                    <p className="text-xs text-gray-500 mt-1">
                      مثال: {selectedCountry.name === 'مصر' ? '1234567890' : 
                             selectedCountry.name === 'قطر' ? '12345678' : 
                             selectedCountry.name === 'السعودية' ? '123456789' : 
                             '123456789'}
                    </p>
                  )}
                  {phoneCheckLoading && (
                    <p className="mt-1 text-sm text-blue-600 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      جاري التحقق من الرقم...
                    </p>
                  )}
                  {phoneExistsError && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      {phoneExistsError}
                    </p>
                  )}
                  {formData.phone.length >= 6 && !phoneExistsError && !phoneCheckLoading && (
                    <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      رقم الهاتف متاح
                    </p>
                  )}
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block mb-2 text-gray-700">كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full py-3 pl-12 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="8 أحرف على الأقل"
                    required
                    minLength={8}
                  />
                  <Lock className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              {/* Confirm Password Input */}
              <div>
                <label className="block mb-2 text-gray-700">تأكيد كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full py-3 pl-12 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أعد إدخال كلمة المرور"
                    required
                  />
                  <Lock className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms and Submit */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-base text-gray-600">أوافق على
                <button type="button" className="ml-1 text-blue-600 hover:underline" onClick={() => setShowTerms(true)}>
                  الشروط والأحكام
                </button>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || phoneCheckLoading || !!phoneExistsError}
              className={`w-full py-4 rounded-lg text-white font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري فحص البيانات...
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5" />
                  التحقق من رقم الهاتف
                  {formData.country && formData.country !== 'مصر' && (
                    <span className="text-sm opacity-90">(WhatsApp)</span>
                  )}
                  {formData.country === 'مصر' && (
                    <span className="text-sm opacity-90">(SMS)</span>
                  )}
                </>
              )}
            </button>

            {/* Login Link */}
            <div className="text-center text-gray-600 space-y-2">
              <div>
                لديك حساب بالفعل؟{' '}
                <button
                  type="button"
                  onClick={() => router.push('/auth/login')}
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  تسجيل الدخول
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => router.push('/auth/forgot-password')}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
            </div>

            {/* Google Login Button */}
            {/* ابحث عن أي كود أو زر متعلق بـ loginWithGoogle أو Google واحذفه بالكامل من الفورم */}
          </form>
        </div>

        {/* Terms and Conditions Dialog */}
        <AlertDialog open={showTerms} onOpenChange={setShowTerms}>
          <AlertDialogContent className="max-w-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="mb-4 text-2xl font-bold">
                الشروط والأحكام وسياسة الخصوصية
              </AlertDialogTitle>
            </AlertDialogHeader>
            <div className="space-y-4 text-gray-700 overflow-y-auto max-h-[60vh]">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">1. مقدمة</h3>
                <div className="text-sm text-gray-600">
                  مرحباً بك في منصة El7hm. نحن نقدم خدمات رياضية متخصصة تهدف إلى ربط اللاعبين بالفرص المناسبة.
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold">2. شروط التسجيل</h3>
                <div className="space-y-2">
                  <div className="flex gap-2 text-sm text-gray-600">
                    <span>•</span>
                    <span>يجب أن تكون فوق 16 عاماً للتسجيل في المنصة</span>
                  </div>
                  <div className="flex gap-2 text-sm text-gray-600">
                    <span>•</span>
                    <span>يجب تقديم معلومات صحيحة ودقيقة عند التسجيل</span>
                  </div>
                  <div className="flex gap-2 text-sm text-gray-600">
                    <span>•</span>
                    <span>يجب الحفاظ على سرية معلومات حسابك</span>
                  </div>
                  <div className="flex gap-2 text-sm text-gray-600">
                    <span>•</span>
                    <span>يحق لنا إيقاف أي حساب يخالف شروط الاستخدام</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold">3. سياسة الخصوصية</h3>
                <div className="space-y-2">
                  <div className="flex gap-2 text-sm text-gray-600">
                    <span>•</span>
                    <span>نحن نحمي معلوماتك الشخصية ونحترم خصوصيتك</span>
                  </div>
                  <div className="flex gap-2 text-sm text-gray-600">
                    <span>•</span>
                    <span>لن نشارك معلوماتك مع أي طرف ثالث دون موافقتك</span>
                  </div>
                  <div className="flex gap-2 text-sm text-gray-600">
                    <span>•</span>
                    <span>يمكنك طلب حذف حسابك وبياناتك في أي وقت</span>
                  </div>
                  <div className="flex gap-2 text-sm text-gray-600">
                    <span>•</span>
                    <span>نستخدم تقنيات تشفير متقدمة لحماية بياناتك</span>
                  </div>
                </div>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Phone Verification Modal */}
      <UnifiedOTPVerification
        phoneNumber={pendingPhone || `${formData.countryCode}${formData.phone}`}
        name={formData.name}
        isOpen={showPhoneVerification}
        onVerificationSuccess={handlePhoneVerificationSuccess}
        onVerificationFailed={handlePhoneVerificationFailed}
        onClose={handlePhoneVerificationClose}
        title="التحقق من رقم الهاتف"
        subtitle={`تم إرسال رمز التحقق عبر ${formData.country === 'مصر' ? 'SMS' : 'WhatsApp أو SMS'}`}
        otpExpirySeconds={30}
        maxAttempts={3}
      />
    </>
  );
}
