'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/lib/firebase/auth-provider';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  AlertTriangle,
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
  Users
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    accountType: '',
    name: '',
    agreeToTerms: false,
    country: '',
    countryCode: '',
    currency: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const accountTypes = [
    { value: 'player', label: 'لاعب', icon: Star },
    { value: 'club', label: 'نادي', icon: Home },
    { value: 'agent', label: 'وكيل لاعبين', icon: UserCheck },
    { value: 'academy', label: 'أكاديمية', icon: Users },
    { value: 'trainer', label: 'مدرب', icon: User },
    { value: 'marketer', label: 'مسوق لاعبين', icon: Users }
  ];

  const countries = [
    { name: 'مصر', code: '+20', currency: 'EGP', currencySymbol: 'ج.م' },
    { name: 'السعودية', code: '+966', currency: 'SAR', currencySymbol: 'ر.س' },
    { name: 'الإمارات', code: '+971', currency: 'AED', currencySymbol: 'د.إ' },
    { name: 'قطر', code: '+974', currency: 'QAR', currencySymbol: 'ر.ق' },
    { name: 'الكويت', code: '+965', currency: 'KWD', currencySymbol: 'د.ك' },
    { name: 'البحرين', code: '+973', currency: 'BHD', currencySymbol: 'د.ب' },
    { name: 'عمان', code: '+968', currency: 'OMR', currencySymbol: 'ر.ع' },
    { name: 'المغرب', code: '+212', currency: 'MAD', currencySymbol: 'د.م' },
    { name: 'الجزائر', code: '+213', currency: 'DZD', currencySymbol: 'د.ج' },
    { name: 'تونس', code: '+216', currency: 'TND', currencySymbol: 'د.ت' },
    { name: 'ليبيا', code: '+218', currency: 'LYD', currencySymbol: 'د.ل' },
    { name: 'السودان', code: '+249', currency: 'SDG', currencySymbol: 'ج.س' },
    { name: 'العراق', code: '+964', currency: 'IQD', currencySymbol: 'د.ع' },
    { name: 'سوريا', code: '+963', currency: 'SYP', currencySymbol: 'ل.س' },
    { name: 'لبنان', code: '+961', currency: 'LBP', currencySymbol: 'ل.ل' },
    { name: 'الأردن', code: '+962', currency: 'JOD', currencySymbol: 'د.أ' },
    { name: 'فلسطين', code: '+970', currency: 'ILS', currencySymbol: '₪' },
    { name: 'اليمن', code: '+967', currency: 'YER', currencySymbol: 'ر.ي' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    // إذا كان الحقل هو رقم الهاتف، نتأكد من أنه يحتوي فقط على أرقام
    if (name === 'phone') {
      const numbersOnly = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numbersOnly
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

    // التحقق من صحة تنسيق رقم الهاتف
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError('يرجى إدخال رقم هاتف صحيح مكون من 10 أرقام');
      return false;
    }

    // التحقق من كلمة المرور
    if (formData.password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      return false;
    }

    // التحقق من نوع الحساب
    if (!formData.accountType) {
      setError('يرجى اختيار نوع الحساب');
      return false;
    }

    // التحقق من الموافقة على الشروط
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

    setLoading(true);
    try {
      const selectedCountry = countries.find(c => c.name === formData.country);
      await registerUser(
        `${formData.phone}@hagzzgo.com`,
        formData.password,
        {
          ...formData,
          email: `${formData.phone}@hagzzgo.com`,
          currency: selectedCountry?.currency || 'SAR',
          currencySymbol: selectedCountry?.currencySymbol || 'ر.س'
        }
      );
      setMessage('تم التسجيل بنجاح! جاري تحويلك...');
      setTimeout(() => router.push('/auth/login'), 1500);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || 'حدث خطأ أثناء التسجيل. حاول مرة أخرى.');
      } else {
        setError('حدث خطأ أثناء التسجيل. حاول مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-600 to-purple-700" dir="rtl">
      <div className="w-full max-w-xl overflow-hidden bg-white shadow-2xl rounded-xl">
        {/* Header Section */}
        <div className="p-6 text-center text-white bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="flex justify-center mb-4">
            <Shield className="w-12 h-12" />
          </div>
          <h1 className="mb-2 text-3xl font-bold">إنشاء حساب جديد</h1>
          <p className="text-blue-100">انضم إلى مجتمعنا الرياضي</p>
        </div>

        <form onSubmit={handleRegister} className="p-8 space-y-6">
          {/* Error and Success Messages */}
          {error && (
            <div className="flex items-center gap-2 p-4 text-red-700 rounded-lg bg-red-50">
              <AlertTriangle className="w-5 h-5" />
              <p>{error}</p>
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
                  onChange={(e) => {
                    const selectedCountry = countries.find(c => c.name === e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      country: e.target.value,
                      countryCode: selectedCountry?.code || '',
                      currency: selectedCountry?.currency || '',
                      currencySymbol: selectedCountry?.currencySymbol || ''
                    }));
                  }}
                  className="w-full py-3 pl-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">اختر الدولة</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.name}>
                      {country.name} ({country.code}) - {country.currencySymbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phone Input */}
            <div>
              <label className="block mb-2 text-gray-700">رقم الهاتف</label>
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
                    className="w-full py-3 pl-4 pr-10 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل رقم الهاتف"
                    required
                    maxLength={10}
                    pattern="[0-9]{10}"
                  />
                  <Phone className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                </div>
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
            disabled={loading}
            className={`w-full py-4 rounded-lg text-white font-bold text-lg transition-all flex items-center justify-center gap-2 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري التسجيل...
              </>
            ) : (
              <>
                <UserCheck className="w-5 h-5" />
                إنشاء حساب جديد
              </>
            )}
          </button>

          {/* Login Link */}
          <div className="text-center text-gray-600">
            لديك حساب بالفعل؟{' '}
            <button
              type="button"
              onClick={() => router.push('/auth/login')}
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              تسجيل الدخول
            </button>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={loginWithGoogle}
            className="flex items-center justify-center w-full gap-2 py-2 mt-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 19.5-21 0-1.4-.1-2.4-.3-3.5z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 17.1 19.2 14 24 14c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.6 3 24 3c-7.2 0-13.3 4.1-16.7 10.1z"/><path fill="#FBBC05" d="M24 44c5.1 0 9.8-1.7 13.4-4.7l-6.2-5.1C29.1 36.9 26.7 38 24 38c-6.1 0-11.2-4.1-13-9.6l-6.7 5.2C7.1 39.9 14.9 44 24 44z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.1 5.5-7.7 5.5-4.6 0-8.3-3.7-8.3-8.3s3.7-8.3 8.3-8.3c2.3 0 4.3.8 5.9 2.2l6.4-6.4C34.5 5.1 29.6 3 24 3c-7.2 0-13.3 4.1-16.7 10.1z"/></g></svg>
            التسجيل عبر جوجل
          </button>
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
          مرحباً بك في منصة Hagzz-Go. نحن نقدم خدمات رياضية متخصصة تهدف إلى ربط اللاعبين بالفرص المناسبة.
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
  );
}