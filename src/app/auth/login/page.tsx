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
    Shield
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import EmailVerification from '@/components/auth/EmailVerification';
import { EmailService } from '@/lib/emailjs/service';

export default function LoginPage() {
  const { login, user, userData, loading: authLoading } = useAuth();
  
  // إذا كان المستخدم مسجل دخوله مسبقاً، نخفي النموذج
  const shouldShowForm = !authLoading && !user;
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

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
    
    if (rememberMe === 'true' && savedEmail) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        rememberMe: true
      }));
      secureConsole.log('📧 Auto-filled email from Remember Me');
    }
  }, []);

  const handleInputChange = (e: { target: { name: string; value: string; type: string; checked: boolean; }; }) => {
    const { name, value, type, checked } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const getDashboardRoute = (accountType: string) => {
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



  const handleLogin = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

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

    try {
      secureConsole.log('🔐 محاولة تسجيل الدخول...');
      setMessage('جاري التحقق من البيانات...');
      
      // محاولة تسجيل الدخول مباشرة
      const result = await login(formData.email, formData.password);
      
      secureConsole.log('✅ تم تسجيل الدخول بنجاح');
      
      // حفظ معلومات Remember Me إذا كان مطلوباً
      if (formData.rememberMe && formData.email) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('userEmail', formData.email);
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
        const noAccountError = `البريد الإلكتروني غير مسجل في النظام

الحلول المقترحة:
• تحقق من صحة البريد الإلكتروني المدخل
• قم بإنشاء حساب جديد إذا لم يكن لديك حساب
• تواصل مع الدعم الفني إذا كنت متأكداً من صحة البريد`;
        
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
            <h1 className="mb-1 text-xl font-bold">جاري التحقق...</h1>
          </div>
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <p className="text-gray-600">
              {authLoading ? 'جاري التحقق من بيانات المصادقة...' : 'جاري تحميل بيانات المستخدم...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // إذا كان المستخدم مسجل دخوله مسبقاً، نعرض خيار الذهاب للوحة التحكم
  if (user && userData && !loading) {
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
                {userData.accountType === 'admin' && 'أدمن'}
                {userData.accountType === 'parent' && 'ولي أمر'}
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
                  import('@/lib/firebase/config').then(({ auth }) => {
                    import('firebase/auth').then(({ signOut }) => {
                      signOut(auth).then(() => {
                        setMessage('تم تسجيل الخروج بنجاح');
                        setError('');
                      });
                    });
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
      className="flex items-center justify-center min-h-screen p-2 bg-gradient-to-br from-blue-600 to-purple-700"
      dir="rtl"
    >
      <div className="w-full max-w-xs overflow-hidden transition-all duration-500 transform bg-white shadow-2xl rounded-xl hover:scale-102">
        {/* Header */}
        <div className="p-3 text-center text-white bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="flex justify-center mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="mb-1 text-xl font-bold">مرحباً بعودتك</h1>
          <p className="text-xs text-blue-100">قم بتسجيل الدخول للوصول إلى حسابك</p>
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
            <p>جميع البيانات مشفرة ومحمية باستخدام أحدث تقنيات التشفير والحماية</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div className="relative">
              <label className="block mb-1 text-xs text-gray-700">البريد الإلكتروني</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full py-2 pl-3 pr-8 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل البريد الإلكتروني"
                  required
                />
                <Phone className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-2 top-1/2" />
              </div>
            </div>

            <div className="relative">
              <label className="block mb-1 text-xs text-gray-700">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full py-2 pl-10 pr-8 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل كلمة المرور"
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
                <label className="text-xs text-gray-600">تذكرني</label>
              </div>
              <button
                type="button"
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                onClick={() => (window.location.href = '/auth/forgot-password')}
              >
                نسيت كلمة المرور؟
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
              'تسجيل الدخول'
            )}
          </button>

          {/* Register Link */}
          <div className="text-xs text-center text-gray-600">
            ليس لديك حساب؟{' '}
            <button
              type="button"
              onClick={() => (window.location.href = '/auth/register')}
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              إنشاء حساب
            </button>
          </div>

          {/* Account Types Info */}
          <div className="pt-3 text-xs text-center text-gray-500 border-t">
            <p className="mb-2">أنواع الحسابات المتاحة:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span className="text-blue-600">• لاعب</span>
              <span className="text-green-600">• نادي</span>
              <span className="text-purple-600">• وكيل لاعبين</span>
              <span className="text-orange-600">• أكاديمية</span>
              <span className="text-cyan-600">• مدرب</span>
              <span className="text-red-600">• مسوق لاعبين</span>
            </div>
          </div>
        </form>

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
