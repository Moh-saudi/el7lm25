'use client';

import { useAuth } from '@/lib/firebase/auth-provider';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
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
import { useState } from 'react';

export default function LoginPage() {
  const { loginUser, loginWithGoogle, user } = useAuth();
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      case 'marketer':
        return '/dashboard';
      default:
        return '/dashboard';
    }
  };

  const handleLogin = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await loginUser(formData.phone, formData.password);
      
      // Get user data using the user's UID from auth context
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const accountType = userData.accountType;
          
          setMessage('تم تسجيل الدخول بنجاح! جاري تحويلك...');

          if (formData.rememberMe) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('userPhone', formData.phone);
            localStorage.setItem('accountType', accountType);
          }

          const dashboardRoute = getDashboardRoute(accountType);
          
          setTimeout(() => {
            router.push(dashboardRoute);
          }, 1500);
        } else {
          setError('لم يتم العثور على بيانات المستخدم. يرجى المحاولة مرة أخرى.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

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
            <div className="flex items-center gap-2 p-2 text-xs text-red-700 rounded-lg bg-red-50">
              <AlertTriangle className="w-4 h-4" />
              <p>{error}</p>
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
              <label className="block mb-1 text-xs text-gray-700">رقم الهاتف</label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full py-2 pl-3 pr-8 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل رقم الهاتف"
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
                onClick={() => alert('سيتم إرسال رابط إعادة تعيين كلمة المرور إلى هاتفك')}
              >
                نسيت كلمة المرور؟
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري تسجيل الدخول...</span>
              </div>
            ) : (
              'تسجيل الدخول'
            )}
          </button>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={loginWithGoogle}
            className="flex items-center justify-center w-full gap-2 py-2 mt-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 19.5-21 0-1.4-.1-2.4-.3-3.5z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 17.1 19.2 14 24 14c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.6 3 24 3c-7.2 0-13.3 4.1-16.7 10.1z"/><path fill="#FBBC05" d="M24 44c5.1 0 9.8-1.7 13.4-4.7l-6.2-5.1C29.1 36.9 26.7 38 24 38c-6.1 0-11.2-4.1-13-9.6l-6.7 5.2C7.1 39.9 14.9 44 24 44z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.1 5.5-7.7 5.5-4.6 0-8.3-3.7-8.3-8.3s3.7-8.3 8.3-8.3c2.3 0 4.3.8 5.9 2.2l6.4-6.4C34.5 5.1 29.6 3 24 3c-7.2 0-13.3 4.1-16.7 10.1z"/></g></svg>
            تسجيل الدخول عبر جوجل
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
              <span className="text-orange-600">• مسوق لاعبين</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
