'use client';

import { useAuth } from '@/lib/firebase/auth-provider';
import { secureConsole } from '@/lib/utils/secure-console';
import {
    AlertTriangle,
    CheckCircle,
    Eye,
    EyeOff,
    KeyRound,
    Loader2,
    Lock,
    Phone,
    Shield,
    User,
    Mail
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import EmailVerification from '@/components/auth/EmailVerification';
import { EmailService } from '@/lib/emailjs/service';
import { getInvalidAccountMessage, getContactInfo } from '@/lib/support-contact';
import { useTranslation } from '@/lib/translations/simple-context';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import SMSOTPVerification from '@/components/shared/SMSOTPVerification';

export default function LoginPage() {
  const { login, logout, user, userData, loading: authLoading } = useAuth();
  const { t, direction } = useTranslation();
  
  // إذا كان المستخدم مسجل دخوله مسبقاً، نخفي النموذج
  const shouldShowForm = !authLoading && !user;
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    rememberMe: false,
  });
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone'); // تغيير الافتراضي لرقم الهاتف
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  // قائمة الدول مع أكوادها وأطوال أرقام الهاتف
  const countries = [
    { name: 'السعودية', code: '+966', phoneLength: 9, phonePattern: '[0-9]{9}' },
    { name: 'الإمارات', code: '+971', phoneLength: 9, phonePattern: '[0-9]{9}' },
    { name: 'الكويت', code: '+965', phoneLength: 8, phonePattern: '[0-9]{8}' },
    { name: 'قطر', code: '+974', phoneLength: 8, phonePattern: '[0-9]{8}' },
    { name: 'البحرين', code: '+973', phoneLength: 8, phonePattern: '[0-9]{8}' },
    { name: 'عمان', code: '+968', phoneLength: 8, phonePattern: '[0-9]{8}' },
    { name: 'مصر', code: '+20', phoneLength: 10, phonePattern: '[0-9]{10}' },
    { name: 'الأردن', code: '+962', phoneLength: 9, phonePattern: '[0-9]{9}' },
    { name: 'لبنان', code: '+961', phoneLength: 8, phonePattern: '[0-9]{8}' },
    { name: 'العراق', code: '+964', phoneLength: 10, phonePattern: '[0-9]{10}' },
    { name: 'سوريا', code: '+963', phoneLength: 9, phonePattern: '[0-9]{9}' },
    { name: 'المغرب', code: '+212', phoneLength: 9, phonePattern: '[0-9]{9}' },
    { name: 'الجزائر', code: '+213', phoneLength: 9, phonePattern: '[0-9]{9}' },
    { name: 'تونس', code: '+216', phoneLength: 8, phonePattern: '[0-9]{8}' },
    { name: 'ليبيا', code: '+218', phoneLength: 9, phonePattern: '[0-9]{9}' },
  ];

  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default to Saudi Arabia

  // عند تحميل الصفحة: تحقق من وجود بريد معلق في localStorage
  useEffect(() => {
    const storedPendingEmail = localStorage.getItem('pendingEmailVerification');
    if (storedPendingEmail) {
      setPendingEmail(storedPendingEmail);
      setShowEmailVerification(true);
    }
  }, []);

  // إيقاف التحميل إذا فشلت المصادقة أو انتهت
  useEffect(() => {
    if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user]);

  // تحميل بيانات Remember Me عند بدء التطبيق
  useEffect(() => {
    const rememberMe = localStorage.getItem('rememberMe');
    const savedEmail = localStorage.getItem('userEmail');
    const savedPhone = localStorage.getItem('userPhone');
    
    if (rememberMe === 'true') {
      if (savedPhone) {
        setFormData(prev => ({
          ...prev,
          phone: savedPhone,
          rememberMe: true
        }));
        setLoginMethod('phone');
        secureConsole.log('📱 Auto-filled phone from Remember Me');
      } else if (savedEmail) {
        setFormData(prev => ({
          ...prev,
          email: savedEmail,
          rememberMe: true
        }));
        setLoginMethod('email');
        secureConsole.log('📧 Auto-filled email from Remember Me');
      }
    }
  }, []);

  const handleInputChange = (e: { target: { name: string; value: string; type: string; checked: boolean; }; }) => {
    const { name, value, type, checked } = e.target;
    
    // إذا كان الحقل هو رقم الهاتف، نتأكد من أنه يحتوي فقط على أرقام
    if (name === 'phone') {
      const numbersOnly = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numbersOnly
      }));
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const getDashboardRoute = (accountType: string | undefined) => {
    // التحقق من وجود accountType
    if (!accountType) {
      console.error('Account type is undefined');
      return '/auth/login';
    }

    switch (accountType) {
      case 'player':
        return '/dashboard/player';
      case 'club':
        return '/dashboard/club';
      case 'agent':
        return '/dashboard/agent';
      case 'academy':
        return '/dashboard/academy';
      case 'trainer':
        return '/dashboard/trainer';
      case 'admin':
        return '/dashboard/admin';
      case 'marketer':
        return '/dashboard/marketer';
      case 'parent':
        return '/dashboard/player'; // توجيه أولياء الأمور للوحة اللاعبين
      default:
        console.error('Invalid account type:', accountType);
        return '/auth/login'; // إرجاع للتسجيل إذا كان النوع غير صالح
    }
  };

  // دالة للتعامل مع الحسابات المعطلة أو غير المحددة
  const handleInvalidAccount = (accountType: string | undefined) => {
    const errorMessage = getInvalidAccountMessage(accountType);
    setError(errorMessage);
    setLoading(false);
  };

  // دالة للبحث عن البريد الإلكتروني المؤقت باستخدام رقم الهاتف
  const findFirebaseEmailByPhone = async (phone: string): Promise<string | null> => {
    try {
      console.log('🔍 Searching for Firebase email with phone:', phone);
      
      // استخدام API route للبحث عن المستخدم
      const response = await fetch('/api/auth/find-user-by-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone })
      });

      const result = await response.json();
      
      if (result.success && result.user) {
        console.log('✅ Found user with phone:', result.user);
        
        // إرجاع البريد الإلكتروني المستخدم في Firebase
        return result.user.email;
      }
      
      console.log('❌ No user found with phone:', phone);
      return null;
    } catch (error) {
      console.error('Error searching for Firebase email:', error);
      return null;
    }
  };

  // دالة دمج كود الدولة مع الرقم
  function normalizePhone(countryCode: string, phone: string) {
    let local = phone.replace(/^0+/, '');
    local = local.replace(/\D/g, '');
    
    // إضافة + إذا لم يكن موجوداً في كود الدولة
    const cleanCountryCode = countryCode.replace(/\D/g, '');
    const formattedPhone = `+${cleanCountryCode}${local}`;
    
    console.log('🔍 normalizePhone:', { countryCode, phone, cleanCountryCode, local, formattedPhone });
    return formattedPhone;
  }

  const handleLogin = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      let loginEmail: string;
      
      if (loginMethod === 'email') {
        // التحقق من البريد الإلكتروني
        if (!formData.email.trim()) {
          setError('يرجى إدخال البريد الإلكتروني');
          setLoading(false);
          return;
        }

        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
          setError('يرجى إدخال بريد إلكتروني صالح');
          setLoading(false);
          return;
        }
        
        loginEmail = formData.email.trim();
      } else {
        // التحقق من رقم الهاتف
        if (!formData.phone.trim()) {
          setError('يرجى إدخال رقم الهاتف');
          setLoading(false);
          return;
        }

        // التحقق من صحة تنسيق رقم الهاتف حسب الدولة
        const phoneRegex = new RegExp(selectedCountry.phonePattern);
        if (!phoneRegex.test(formData.phone)) {
          setError(`يرجى إدخال رقم هاتف صحيح مكون من ${selectedCountry.phoneLength} أرقام للدولة ${selectedCountry.name}`);
          setLoading(false);
          return;
        }

        // دمج كود الدولة مع الرقم
        const fullPhone = normalizePhone(selectedCountry.code, formData.phone);
        console.log('🔍 Searching for user with phone:', fullPhone);
        
        const firebaseEmail = await findFirebaseEmailByPhone(fullPhone);
        if (!firebaseEmail) {
          setError(`رقم الهاتف غير مسجل في النظام. يرجى إنشاء حساب جديد أو التحقق من صحة الرقم.`);
          setLoading(false);
          return;
        }
        loginEmail = firebaseEmail;
      }

      secureConsole.log('🔐 محاولة تسجيل الدخول...');
      setMessage('جاري التحقق من البيانات...');
      
      // محاولة تسجيل الدخول مباشرة
      const result = await login(loginEmail, formData.password);
      
      secureConsole.log('✅ تم تسجيل الدخول بنجاح');
      
      // التحقق من وجود accountType
      if (!result.userData.accountType) {
        handleInvalidAccount(result.userData.accountType);
        return;
      }

      // التحقق من صحة نوع الحساب
      const validAccountTypes = ['player', 'club', 'agent', 'academy', 'trainer', 'admin', 'marketer', 'parent'];
      if (!validAccountTypes.includes(result.userData.accountType)) {
        handleInvalidAccount(result.userData.accountType);
        return;
      }
      
      // حفظ معلومات Remember Me إذا كان مطلوباً
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        if (loginMethod === 'email') {
          localStorage.setItem('userEmail', formData.email);
        } else {
          localStorage.setItem('userPhone', formData.phone);
        }
        localStorage.setItem('accountType', result.userData.accountType);
      }
      
      setMessage('تم تسجيل الدخول بنجاح! جاري تحويلك...');
      
      // توجيه مباشر للوحة التحكم المناسبة
      const dashboardRoute = getDashboardRoute(result.userData.accountType);
      
      setTimeout(() => {
        router.replace(dashboardRoute);
      }, 1000);
      
    } catch (err: any) {
      secureConsole.error('فشل تسجيل الدخول:', err);
      console.log('Error code:', err.code); // للتأكد من نوع الخطأ
      
      // التحقق من نوع الخطأ
      if (err.code === 'auth/user-not-found') {
        const noAccountError = loginMethod === 'email' 
          ? `البريد الإلكتروني غير مسجل في النظام

الحلول المقترحة:
• تحقق من صحة البريد الإلكتروني المدخل
• قم بإنشاء حساب جديد إذا لم يكن لديك حساب
• تواصل مع الدعم الفني إذا كنت متأكداً من صحة البريد`
          : `رقم الهاتف غير مسجل في النظام

الحلول المقترحة:
• تحقق من صحة رقم الهاتف المدخل
• قم بإنشاء حساب جديد إذا لم يكن لديك حساب
• تواصل مع الدعم الفني إذا كنت متأكداً من صحة الرقم`;
        
        setError(noAccountError);
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        const wrongPasswordError = `كلمة المرور غير صحيحة

الحلول المقترحة:
• تحقق من صحة كلمة المرور المدخلة
• تأكد من حالة الأحرف (كبيرة/صغيرة)
• استخدم "نسيت كلمة المرور" لإعادة تعيينها
• تأكد من عدم تفعيل Caps Lock`;
        
        console.log('Setting error:', wrongPasswordError); // للتأكد من تعيين الخطأ
        setError(wrongPasswordError);
      } else if (err.code === 'auth/too-many-requests') {
        const tooManyRequestsError = `تم تجاوز عدد المحاولات المسموح بها

الحلول المقترحة:
• انتظر قليلاً قبل المحاولة مرة أخرى
• استخدم "نسيت كلمة المرور" لإعادة تعيينها
• تواصل مع الدعم الفني إذا استمرت المشكلة`;
        
        setError(tooManyRequestsError);
      } else if (err.code === 'auth/network-request-failed') {
        const networkError = `خطأ في الاتصال

الحلول المقترحة:
• تحقق من اتصالك بالإنترنت
• حاول إعادة تحميل الصفحة
• تأكد من استقرار الاتصال`;
        
        setError(networkError);
      } else if (err.code === 'auth/invalid-email') {
        const invalidEmailError = `صيغة البريد الإلكتروني غير صحيحة

الحلول المقترحة:
• تحقق من صحة البريد الإلكتروني المدخل
• تأكد من وجود @ و . في البريد
• مثال: user@example.com`;
        
        setError(invalidEmailError);
      } else {
        // أخطاء أخرى
        setError(`خطأ في تسجيل الدخول: ${err.message || 'حدث خطأ غير متوقع'}`);
      }
      
      setMessage(''); 
      setLoading(false);
    }
  };

  const handleEmailVerificationSuccess = () => {
    setShowEmailVerification(false);
    setPendingEmail(null);
    localStorage.removeItem('pendingEmailVerification');
    setMessage('✅ تم التحقق من البريد الإلكتروني بنجاح! سيتم تحويلك للوحة التحكم.');
    setTimeout(() => {
      if (userData) {
        const dashboardRoute = getDashboardRoute(userData.accountType);
        router.replace(dashboardRoute);
      }
    }, 1000);
  };

  const handleEmailVerificationFailed = (error: string) => {
    setShowEmailVerification(false);
    setPendingEmail(null);
    localStorage.removeItem('pendingEmailVerification');
    setError(error || 'فشل التحقق من البريد الإلكتروني.');
  };

  const handleEmailVerificationCancel = () => {
    setShowEmailVerification(false);
    setPendingEmail(null);
    localStorage.removeItem('pendingEmailVerification');
    setError('تم إلغاء التحقق من البريد الإلكتروني.');
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = countries.find(c => c.code === e.target.value);
    if (country) setSelectedCountry(country);
  };

  // إذا كان المستخدم يحمل أو مسجل دخوله، نعرض شاشة تحميل
  if (authLoading || (user && !userData)) {
    return (
      <div
        className="flex items-center justify-center min-h-screen p-2 bg-gradient-to-br from-blue-600 to-purple-700"
        dir="rtl"
      >
        <div className="w-full max-w-xs overflow-hidden bg-white shadow-2xl rounded-xl">
          <div className="p-3 text-center text-white bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="flex justify-center mb-2">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="mb-1 text-xl font-bold">{t('login.messages.verifying')}</h1>
          </div>
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <p className="text-gray-600">
              {authLoading ? t('login.messages.loading') : t('login.messages.loadingUserData')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // إذا كان المستخدم مسجل دخوله مسبقاً، نعرض خيار الذهاب للوحة التحكم
  if (user && userData && !loading) {
    // التحقق من صحة نوع الحساب
    if (!userData.accountType || !['player', 'club', 'agent', 'academy', 'trainer', 'admin', 'marketer', 'parent'].includes(userData.accountType)) {
      return (
        <div
          className="flex items-center justify-center min-h-screen p-2 bg-gradient-to-br from-red-600 to-orange-700"
          dir="rtl"
        >
          <div className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-xl">
            <div className="p-3 text-center text-white bg-gradient-to-r from-red-500 to-orange-600">
              <div className="flex justify-center mb-2">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h1 className="mb-1 text-xl font-bold">مشكلة تقنية</h1>
              <p className="text-xs text-red-100">حسابك يحتاج إلى إصلاح</p>
            </div>
            
            <div className="p-6 text-center space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-3">
                  {userData.name || userData.displayName || 'مستخدم'}
                </h2>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-right">
                  <p className="text-sm text-red-800 mb-3">
                    <strong>مشكلة في نوع الحساب:</strong> {userData.accountType || 'غير محدد'}
                  </p>
                  <p className="text-sm text-red-700 mb-4">
                    يرجى التواصل مع الدعم الفني لحل هذه المشكلة
                  </p>
                  <div className="space-y-2 text-sm text-red-600">
                    <p>📧 البريد الإلكتروني: {getContactInfo().email}</p>
                    <p>📱 الواتساب: {getContactInfo().whatsappQatar} أو {getContactInfo().whatsappEgypt}</p>
                    <p>🌐 نموذج الدعم: <a href={getContactInfo().contactForm} className="underline">اضغط هنا</a></p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => logout()}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  تسجيل الخروج
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  إعادة المحاولة
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const dashboardRoute = getDashboardRoute(userData.accountType);
    
    return (
      <div
        className="flex items-center justify-center min-h-screen p-2 bg-gradient-to-br from-blue-600 to-purple-700"
        dir="rtl"
      >
        <div className="w-full max-w-xs overflow-hidden bg-white shadow-2xl rounded-xl">
          <div className="p-3 text-center text-white bg-gradient-to-r from-green-500 to-blue-600">
            <div className="flex justify-center mb-2">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="mb-1 text-xl font-bold">مرحباً بك!</h1>
            <p className="text-xs text-green-100">أنت مسجل دخولك بالفعل</p>
          </div>
          
          <div className="p-6 text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                {userData.name || userData.displayName || 'مستخدم'}
              </h2>
              <p className="text-sm text-gray-600">
                نوع الحساب: {userData.accountType === 'player' && 'لاعب'}
                {userData.accountType === 'club' && 'نادي'}
                {userData.accountType === 'agent' && 'وكيل'}
                {userData.accountType === 'academy' && 'أكاديمية'}
                {userData.accountType === 'trainer' && 'مدرب'}
                {userData.accountType === 'admin' && 'مدير'}
                {userData.accountType === 'marketer' && 'مسوق'}
                {userData.accountType === 'parent' && 'ولي أمر'}
                {!userData.accountType && 'غير محدد'}
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push(dashboardRoute)}
                className="w-full py-3 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                الذهاب إلى لوحة التحكم
              </button>
              
              <button
                onClick={() => {
                  // تسجيل خروج والبقاء في صفحة الدخول
                  logout().then(() => {
                    setMessage('تم تسجيل الخروج بنجاح');
                    setError('');
                  }).catch((error) => {
                    console.error('خطأ في تسجيل الخروج:', error);
                    setError('حدث خطأ أثناء تسجيل الخروج');
                  });
                }}
                className="w-full py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div
        className={`flex items-center justify-center min-h-screen p-2 bg-gradient-to-br from-blue-600 to-purple-700 ${direction === 'rtl' ? 'dir-rtl' : 'dir-ltr'}`}
      >
      <div className="w-full max-w-xs overflow-hidden transition-all duration-500 transform bg-white shadow-2xl rounded-xl hover:scale-102">
        {/* Header */}
        <div className="p-3 text-center text-white bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="flex justify-center mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="mb-1 text-xl font-bold">{t('login.title')}</h1>
          <p className="text-xs text-blue-100">{t('login.subtitle')}</p>
          
          {/* Language Switcher */}
          <div className="flex justify-center mt-2">
            <LanguageSwitcher variant="simple" />
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-4 space-y-4">
          {/* Alert Messages */}
          {error && (
            <div className="p-3 text-sm text-red-700 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="whitespace-pre-line">
                    {error}
                  </div>
                  <div className="flex gap-2 mt-3 text-xs">
                    <button
                      type="button"
                      onClick={() => window.location.href = '/auth/forgot-password'}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      نسيت كلمة المرور
                    </button>
                    <button
                      type="button"
                      onClick={() => window.location.href = '/auth/register'}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      إنشاء حساب جديد
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {message && (
            <div className="flex items-center gap-2 p-2 text-xs text-green-700 rounded-lg bg-green-50">
              <CheckCircle className="w-4 h-4" />
              <p>{message}</p>
            </div>
          )}

          {/* Security Notice */}
          <div className="flex items-center gap-2 p-2 text-xs text-blue-700 rounded-lg bg-blue-50">
            <KeyRound className="flex-shrink-0 w-4 h-4" />
            <p>{t('login.security.notice')}</p>
          </div>

          {/* Login Method Toggle */}
          <div className="flex items-center justify-center space-x-2 p-2 bg-gray-50 rounded-lg">
            <button
              type="button"
              onClick={() => setLoginMethod('phone')}
              className={`flex items-center gap-2 px-3 py-1 text-xs rounded-lg transition-colors ${
                loginMethod === 'phone'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Phone className="w-3 h-3" />
              {t('login.methods.phone')}
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('email')}
              className={`flex items-center gap-2 px-3 py-1 text-xs rounded-lg transition-colors ${
                loginMethod === 'email'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Mail className="w-3 h-3" />
              {t('login.methods.email')}
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            {loginMethod === 'phone' ? (
              <div className="space-y-3">
                {/* Country Selection */}
                <div>
                  <label className="block mb-1 text-xs text-gray-700">{t('login.form.country')}</label>
                  <div className="relative">
                    <select
                      value={selectedCountry.code}
                      onChange={handleCountryChange}
                      className="w-full py-2 pl-3 pr-8 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                        {country.name} ({country.code}) - {country.phoneLength} أرقام
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Phone Input */}
                <div>
                  <label className="block mb-1 text-xs text-gray-700">
                    {t('login.form.phone')}
                    <span className="text-xs text-gray-500 mr-1">
                      ({selectedCountry.phoneLength} {t('login.form.digits')})
                    </span>
                  </label>
                  <div className="relative">
                    <div className="flex">
                      <div className="flex items-center px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-sm">
                        {selectedCountry.code}
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full py-2 pl-3 pr-8 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`${selectedCountry.phoneLength} ${t('login.form.digits')}`}
                        pattern={selectedCountry.phonePattern}
                        maxLength={selectedCountry.phoneLength}
                        required
                      />
                      <Phone className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-2 top-1/2" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                    {t('login.form.example')}: {selectedCountry.name === 'مصر' ? '1234567890' : 
                             selectedCountry.name === 'قطر' ? '12345678' : 
                             selectedCountry.name === 'السعودية' ? '123456789' : 
                             '123456789'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <label className="block mb-1 text-xs text-gray-700">{t('login.form.email')}</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full py-2 pl-3 pr-8 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('login.form.enterEmail')}
                    required
                  />
                  <Mail className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-2 top-1/2" />
                </div>
              </div>
            )}

            <div className="relative">
              <label className="block mb-1 text-xs text-gray-700">{t('login.form.password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full py-2 pl-10 pr-8 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('login.form.enterPassword')}
                  required
                />
                <Lock className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-2 top-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 -translate-y-1/2 left-2 top-1/2 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-3 h-3 text-blue-600 rounded"
                />
                <label className="text-xs text-gray-600">{t('login.form.rememberMe')}</label>
              </div>
              <button
                type="button"
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                onClick={() => (window.location.href = '/auth/forgot-password')}
              >
                {t('login.form.forgotPassword')}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || authLoading}
            className="w-full py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(loading || authLoading) ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                {authLoading ? 'جاري التحقق من البيانات...' : 'جاري تسجيل الدخول...'}
                </span>
              </div>
            ) : (
              t('login.form.login')
            )}
          </button>

          {/* Register Link */}
          <div className="text-xs text-center text-gray-600">
          {t('login.messages.noAccount')}{' '}
            <button
              type="button"
              onClick={() => (window.location.href = '/auth/register')}
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
            {t('login.messages.createAccount')}
            </button>
          </div>

          {/* Account Types Info */}
          <div className="pt-3 text-xs text-center text-gray-500 border-t">
          <p className="mb-2">{t('login.messages.accountTypes')}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
            <span className="text-blue-600">• لاعب</span>
            <span className="text-green-600">• نادي</span>
            <span className="text-purple-600">• وكيل</span>
            <span className="text-orange-600">• أكاديمية</span>
            <span className="text-cyan-600">• مدرب</span>
            <span className="text-red-600">• مسوق</span>
            </div>
          </div>
        </form>

      {/* Email Verification Modal */}
        {showEmailVerification && pendingEmail && (
          <EmailVerification
            email={pendingEmail}
            name={userData?.name || 'مستخدم'}
            onVerificationSuccess={handleEmailVerificationSuccess}
            onVerificationFailed={handleEmailVerificationFailed}
            onCancel={handleEmailVerificationCancel}
          />
        )}
      </div>
      </div>
  );
}
