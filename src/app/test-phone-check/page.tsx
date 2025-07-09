'use client';

import { useState } from 'react';
import { Check, X, Loader2, Phone } from 'lucide-react';

// قائمة الدول مع أكوادها
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

export default function TestPhoneCheck() {
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [checkResult, setCheckResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCountryChange = (countryName: string) => {
    const country = countries.find(c => c.name === countryName);
    setSelectedCountry(country);
    setPhoneNumber('');
    setCheckResult(null);
  };

  const handlePhoneChange = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '');
    setPhoneNumber(numbersOnly);
    setCheckResult(null);
  };

  const checkPhoneExists = async () => {
    if (!selectedCountry || !phoneNumber) {
      setCheckResult({
        success: false,
        message: 'يرجى اختيار الدولة وإدخال رقم الهاتف'
      });
      return;
    }

    setLoading(true);
    try {
      const fullPhoneNumber = `${selectedCountry.code}${phoneNumber}`;
      console.log('🔍 Testing phone check:', {
        country: selectedCountry.name,
        countryCode: selectedCountry.code,
        phoneNumber,
        fullPhoneNumber
      });

      const response = await fetch('/api/auth/check-user-exists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullPhoneNumber
        }),
      });

      const data = await response.json();
      console.log('📊 API Response:', data);

      setCheckResult({
        success: true,
        phoneExists: data.phoneExists,
        message: data.phoneExists 
          ? 'رقم الهاتف مستخدم بالفعل' 
          : 'رقم الهاتف متاح',
        details: {
          fullPhoneNumber,
          country: selectedCountry.name,
          phoneLength: phoneNumber.length,
          requiredLength: selectedCountry.phoneLength
        }
      });
    } catch (error) {
      console.error('❌ Check error:', error);
      setCheckResult({
        success: false,
        message: 'حدث خطأ في التحقق من رقم الهاتف'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            اختبار التحقق من رقم الهاتف
          </h1>
          
          <div className="space-y-4">
            {/* اختيار الدولة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الدولة
              </label>
              <select
                value={selectedCountry?.name || ''}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">اختر الدولة</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.name} ({country.code}) - {country.phoneLength} أرقام
                  </option>
                ))}
              </select>
            </div>

            {/* رقم الهاتف */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder={selectedCountry ? `${selectedCountry.phoneLength} أرقام` : "رقم الهاتف"}
                  maxLength={selectedCountry?.phoneLength || 10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {selectedCountry && (
                <p className="text-xs text-gray-500 mt-1">
                  مثال: {selectedCountry.code}123456789
                </p>
              )}
            </div>

            {/* زر التحقق */}
            <button
              onClick={checkPhoneExists}
              disabled={loading || !selectedCountry || !phoneNumber}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                loading || !selectedCountry || !phoneNumber
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  جاري التحقق...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 inline mr-2" />
                  التحقق من رقم الهاتف
                </>
              )}
            </button>

            {/* نتيجة التحقق */}
            {checkResult && (
              <div className={`p-4 rounded-lg border ${
                checkResult.success && checkResult.phoneExists
                  ? 'bg-red-50 border-red-200'
                  : checkResult.success && !checkResult.phoneExists
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center gap-2">
                  {checkResult.success && checkResult.phoneExists ? (
                    <X className="w-5 h-5 text-red-500" />
                  ) : checkResult.success && !checkResult.phoneExists ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className={`font-medium ${
                    checkResult.success && checkResult.phoneExists
                      ? 'text-red-700'
                      : checkResult.success && !checkResult.phoneExists
                      ? 'text-green-700'
                      : 'text-yellow-700'
                  }`}>
                    {checkResult.message}
                  </span>
                </div>
                
                {checkResult.details && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>الرقم الكامل: {checkResult.details.fullPhoneNumber}</p>
                    <p>الدولة: {checkResult.details.country}</p>
                    <p>طول الرقم: {checkResult.details.phoneLength}/{checkResult.details.requiredLength}</p>
                  </div>
                )}
              </div>
            )}

            {/* معلومات إضافية */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">معلومات الاختبار:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• هذا الاختبار يتحقق من وجود رقم الهاتف في قاعدة البيانات</li>
                <li>• يتم البحث في مجموعة "users" في Firestore</li>
                <li>• الرقم يجب أن يكون بالتنسيق الكامل مع رمز الدولة</li>
                <li>• يمكنك تجربة أرقام مختلفة لاختبار النظام</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 