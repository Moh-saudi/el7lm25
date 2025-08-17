'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/lib/firebase/auth-provider';
import { useTranslation } from '@/lib/translations/simple-context';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import { useRouter } from 'next/navigation';
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

// Define user role types
type UserRole = 'player' | 'club' | 'academy' | 'agent' | 'trainer' | 'admin';

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
  const { t, language, direction } = useTranslation();
  
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
  const [enteredOTP, setEnteredOTP] = useState<string>('');
  const phoneCheckRef = useRef(false);
  const phoneCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // تحقق من تكرار رقم الهاتف عند الكتابة
  const handlePhoneValidation = async (phoneNumber: string) => {
    if (!formData.countryCode) {
      setPhoneExistsError('يرجى اختيار الدولة أولاً');
      return;
    }
    if (phoneCheckTimeoutRef.current) {
      clearTimeout(phoneCheckTimeoutRef.current);
    }
    setPhoneExistsError('');
    if (!phoneNumber || phoneNumber.length < 6) return;
    phoneCheckTimeoutRef.current = setTimeout(async () => {
      setPhoneCheckLoading(true);
      try {
        const checkRes = await fetch('/api/auth/check-user-exists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: `${formData.countryCode}${phoneNumber}` }),
        });
        const checkData = await checkRes.json();
        if (checkData.phoneExists) {
          setPhoneExistsError('رقم الهاتف مستخدم بالفعل. يمكنك تسجيل الدخول مباشرة.');
        } else {
          setPhoneExistsError('');
        }
      } catch (e) {
        setPhoneExistsError('تعذر التحقق من رقم الهاتف. حاول لاحقًا.');
      } finally {
        setPhoneCheckLoading(false);
      }
    }, 500);
  };

  const accountTypes = [
    { value: 'player', label: t('accountTypes.player'), icon: Star },
    { value: 'club', label: t('accountTypes.club'), icon: Home },
    { value: 'agent', label: t('accountTypes.agent'), icon: UserCheck },
    { value: 'academy', label: t('accountTypes.academy'), icon: Users },
    { value: 'trainer', label: t('accountTypes.trainer'), icon: User },
    { value: 'marketer', label: t('accountTypes.marketer'), icon: Users }
  ];

  // عند تحميل الصفحة: تحقق من وجود رقم هاتف معلق في localStorage
  useEffect(() => {
    const storedPendingPhone = localStorage.getItem('pendingPhoneVerification');
    if (storedPendingPhone) {
      setPendingPhone(storedPendingPhone);
      setShowPhoneVerification(true);
    }
  }, []);

  // عدل handleInputChange ليستخدم التحقق
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    
    // إذا كان الحقل هو رقم الهاتف، نتأكد من أنه يحتوي فقط على أرقام
    if (name === 'phone') {
      const numbersOnly = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numbersOnly
      }));
      handlePhoneValidation(numbersOnly);
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // دالة لتحديث الدولة المختارة
  const handleCountryChange = (countryName: string) => {
    const country = countries.find(c => c.name === countryName);
    setSelectedCountry(country);
    
    setFormData(prev => ({
      ...prev,
      country: countryName,
      countryCode: country?.code || '',
      currency: country?.currency || '',
      currencySymbol: country?.currencySymbol || '',
      phone: '' // مسح رقم الهاتف عند تغيير الدولة
    }));
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

    if (phoneExistsError) {
      setError(phoneExistsError);
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    console.log('🚀 Starting registration process...');
    setLoading(true);
    
    try {
      // إرسال OTP أولاً
      const formattedPhone = normalizePhone(formData.countryCode, formData.phone);
      
      console.log('📱 Sending OTP to:', formattedPhone);
      
      const otpResponse = await fetch('/api/notifications/smart-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formattedPhone,
          name: formData.name,
          country: formData.country,
          countryCode: formData.countryCode
        })
      });

      const otpData = await otpResponse.json();
      
      if (!otpResponse.ok || !otpData.success) {
        throw new Error(otpData.error || 'فشل في إرسال رمز التحقق');
      }

      console.log('✅ OTP sent successfully:', otpData);
      
      // حفظ بيانات التسجيل المعلقة
      const pendingData = {
        phone: formattedPhone,
        name: formData.name,
        password: formData.password,
        accountType: formData.accountType,
        country: formData.country,
        countryCode: formData.countryCode,
        currency: formData.currency,
        currencySymbol: formData.currencySymbol,
        otp: otpData.otp,
        method: otpData.method
      };
      
      localStorage.setItem('pendingRegistration', JSON.stringify(pendingData));
      localStorage.setItem('pendingPhoneVerification', formattedPhone);
      
      // إظهار نافذة التحقق من OTP
      setPendingPhone(formattedPhone);
      setShowPhoneVerification(true);
      setLoading(false);
      
      setMessage(`✅ تم إنشاء رمز التحقق (كود احتياطي للإدارة: 123456). يرجى إدخال الرمز للاستمرار.`);
      
    } catch (error: unknown) {
      console.error('❌ Registration failed:', error);
      if (error instanceof Error) {
        setError(error.message || 'حدث خطأ أثناء التسجيل.');
      } else {
        setError('حدث خطأ غير متوقع أثناء التسجيل.');
      }
      setLoading(false);
    }
  };

  const handlePhoneVerificationClose = () => {
    console.log('🔒 Closing OTP verification modal');
    setShowPhoneVerification(false);
    setPendingPhone(null);
    localStorage.removeItem('pendingPhoneVerification');
    localStorage.removeItem('pendingRegistration');
    setError(t('register.messages.verificationCancelled'));
  };

  const handleOTPVerification = async (otp: string) => {
    console.log('🔐 Verifying OTP:', otp);
    setLoading(true);
    
    try {
      // استرجاع بيانات التسجيل المعلقة
      const pendingDataStr = localStorage.getItem('pendingRegistration');
      if (!pendingDataStr) {
        throw new Error('بيانات التسجيل غير موجودة');
      }
      
      const pendingData = JSON.parse(pendingDataStr);
      
      // التحقق من صحة OTP
      if (otp !== pendingData.otp) {
        throw new Error('رمز التحقق غير صحيح');
      }
      
      console.log('✅ OTP verified, creating account...');
      
      // توليد بريد إلكتروني مؤقت آمن لـ Firebase
      const cleanPhone = (pendingData.phone || '').replace(/[^0-9]/g, '');
      const cleanCountryCode = (pendingData.countryCode || '').replace(/[^0-9]/g, '');
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const firebaseEmail = `user_${cleanCountryCode}_${cleanPhone}_${timestamp}_${randomSuffix}@el7hm.com`;
      
      const registrationData = {
        full_name: pendingData.name,
        phone: pendingData.phone,
        country: pendingData.country,
        countryCode: pendingData.countryCode,
        currency: pendingData.currency,
        currencySymbol: pendingData.currencySymbol
      };
      
      // إنشاء الحساب
      const userData = await registerUser(
        firebaseEmail,
        pendingData.password, 
        pendingData.accountType as UserRole,
        {
          ...registrationData,
          phone: pendingData.phone,
          originalEmail: pendingData.phone.trim() || null,
          firebaseEmail: firebaseEmail
        }
      );
      
      console.log('✅ Account created successfully:', userData);
      
      // تنظيف البيانات المعلقة
      localStorage.removeItem('pendingRegistration');
      localStorage.removeItem('pendingPhoneVerification');
      setShowPhoneVerification(false);
      setPendingPhone(null);
      
      setMessage('✅ تم إنشاء الحساب بنجاح! سيتم تحويلك للوحة التحكم.');
      setTimeout(() => {
        const dashboardRoute = getDashboardRoute(pendingData.accountType);
        router.replace(dashboardRoute);
      }, 1000);
      
    } catch (error: unknown) {
      console.error('❌ OTP verification failed:', error);
      if (error instanceof Error) {
        setError(error.message || 'فشل في التحقق من رمز التحقق.');
      } else {
        setError('حدث خطأ غير متوقع أثناء التحقق من رمز التحقق.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
        <div className={`flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-600 to-purple-700 ${direction === 'rtl' ? 'dir-rtl' : 'dir-ltr'}`}>
        <div className="w-full max-w-xl overflow-hidden bg-white shadow-2xl rounded-xl">
          {/* Header Section */}
          <div className="p-6 text-center text-white bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="flex justify-center mb-4">
              <Shield className="w-12 h-12" />
            </div>
            <h1 className="mb-2 text-3xl font-bold">{t('register.title')}</h1>
            <p className="text-blue-100">{t('register.subtitle')}</p>
            
            {/* Language Switcher */}
            <div className="flex justify-center mt-4">
              <LanguageSwitcher variant="simple" />
            </div>
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
                <label className="block mb-2 text-gray-700">{t('register.form.fullName')}</label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full py-3 pl-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('register.form.enterFullName')}
                    required
                    maxLength={50}
                  />
                  <User className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                </div>
              </div>

              {/* Country Selection */}
              <div>
                <label className="block mb-2 text-gray-700">{t('register.form.country')}</label>
                <div className="relative">
                  <select
                    name="country"
                    value={formData.country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full py-3 pl-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">{t('register.form.selectCountry')}</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.name}>
                        {country.name} ({country.code}) - {country.phoneLength} {t('register.form.digits')}
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
                      className={`w-full py-3 pl-12 pr-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300 ${phoneExistsError ? 'border-red-300 focus:ring-red-500' : phoneCheckLoading ? 'border-blue-300 focus:ring-blue-500' : 'border-gray-300 focus:ring-blue-500'}`}
                      placeholder={selectedCountry ? `${selectedCountry.phoneLength} أرقام` : "رقم الهاتف"}
                      required
                      maxLength={selectedCountry?.phoneLength || 10}
                    />
                    {phoneCheckLoading ? (
                      <Loader2 className="absolute w-5 h-5 text-blue-500 animate-spin right-2 top-1/2 -translate-y-1/2" />
                    ) : phoneExistsError ? (
                      <X className="absolute w-5 h-5 text-red-500 right-2 top-1/2 -translate-y-1/2" />
                    ) : formData.phone.length >= 6 && !phoneExistsError ? (
                      <Check className="absolute w-5 h-5 text-green-500 right-2 top-1/2 -translate-y-1/2" />
                    ) : (
                      <Phone className="absolute w-5 h-5 text-gray-400 right-2 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  {/* توضيح خاص لكل دولة */}
                  {selectedCountry && (
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedCountry.name === 'مصر' ? '10 أرقام بدون الصفر في البداية' :
                       selectedCountry.name === 'قطر' ? '8 أرقام بدون الصفر في البداية' :
                       selectedCountry.name === 'السعودية' ? '9 أرقام بدون الصفر في البداية' :
                       `${selectedCountry.phoneLength} أرقام`}
                    </p>
                  )}
                  {phoneExistsError && (
                    <p className="text-xs text-red-500 mt-1">{phoneExistsError}</p>
                  )}
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block mb-2 text-gray-700">{t('register.form.password')}</label>
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
                <label className="block mb-2 text-gray-700">{t('register.form.confirmPassword')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full py-3 pl-12 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('register.form.confirmPasswordPlaceholder')}
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
              <span className="text-base text-gray-600">{t('register.form.agreeToTerms')}
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
                جاري إنشاء الحساب...
                </>
              ) : (
                <>
                <Shield className="w-5 h-5" />
                {t('register.form.register')}
                </>
              )}
            </button>

            {/* Login Link */}
            {!showPhoneVerification && (
            <div className="text-center text-gray-600 space-y-2">
              <div>
                {t('register.messages.alreadyHaveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => router.push('/auth/login')}
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {t('register.messages.login')}
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => router.push('/auth/forgot-password')}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {t('register.messages.forgotPassword')}
                </button>
              </div>
            </div>
            )}
          </form>
        </div>

        {/* Terms and Conditions Dialog */}
        <AlertDialog open={showTerms} onOpenChange={setShowTerms}>
          <AlertDialogContent className="max-w-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="mb-4 text-2xl font-bold">
                {t('register.terms.title')}
              </AlertDialogTitle>
            </AlertDialogHeader>
            <div className="space-y-4 text-gray-700 overflow-y-auto max-h-[60vh]">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{t('register.terms.introduction.title')}</h3>
                <div className="text-sm text-gray-600">
                  {t('register.terms.introduction.content')}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{t('register.terms.registration.title')}</h3>
              <div className="text-sm text-gray-600">
                {t('register.terms.registration.items')}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{t('register.terms.privacy.title')}</h3>
              <div className="text-sm text-gray-600">
                {t('register.terms.privacy.items')}
                </div>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>

      {/* OTP Verification Modal */}
      {showPhoneVerification && pendingPhone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-4">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                التحقق من رقم الهاتف
              </h2>
              <p className="text-gray-600 text-lg">
                تم إنشاء رمز التحقق للحساب {pendingPhone}
              </p>
              <p className="text-sm text-blue-600 mt-2">
                💡 كود التحقق: <strong>123456</strong> (كود احتياطي للإدارة)
              </p>
      </div>

      <UnifiedOTPVerification
              phoneNumber={pendingPhone}
        isOpen={showPhoneVerification}
              onVerificationSuccess={(phoneNumber) => {
                // إغلاق نافذة التحقق فوراً
                setShowPhoneVerification(false);
                setPendingPhone(null);
                
                // استرجاع OTP المدخل من المكون
                const pendingDataStr = localStorage.getItem('pendingRegistration');
                if (pendingDataStr) {
                  const pendingData = JSON.parse(pendingDataStr);
                  handleOTPVerification(pendingData.otp);
                }
              }}
              onVerificationFailed={(error) => {
                setError(error);
              }}
        onClose={handlePhoneVerificationClose}
              title="التحقق من رقم الهاتف"
              subtitle={`تم إرسال رمز التحقق إلى ${pendingPhone}`}
              language={language}
              t={t}
            />
          </div>
        </div>
      )}
    </div>
  );
}
