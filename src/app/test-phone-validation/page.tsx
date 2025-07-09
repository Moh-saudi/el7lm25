'use client';

import { useState } from 'react';

// قائمة الدول مع أطوال أرقام الهاتف
const countries = [
  { name: 'السعودية', code: '+966', phoneLength: 9, phonePattern: '[0-9]{9}', example: '501234567' },
  { name: 'الإمارات', code: '+971', phoneLength: 9, phonePattern: '[0-9]{9}', example: '501234567' },
  { name: 'الكويت', code: '+965', phoneLength: 8, phonePattern: '[0-9]{8}', example: '12345678' },
  { name: 'قطر', code: '+974', phoneLength: 8, phonePattern: '[0-9]{8}', example: '12345678' },
  { name: 'البحرين', code: '+973', phoneLength: 8, phonePattern: '[0-9]{8}', example: '12345678' },
  { name: 'عمان', code: '+968', phoneLength: 8, phonePattern: '[0-9]{8}', example: '12345678' },
  { name: 'مصر', code: '+20', phoneLength: 10, phonePattern: '[0-9]{10}', example: '1234567890' },
  { name: 'الأردن', code: '+962', phoneLength: 9, phonePattern: '[0-9]{9}', example: '123456789' },
  { name: 'لبنان', code: '+961', phoneLength: 8, phonePattern: '[0-9]{8}', example: '12345678' },
  { name: 'العراق', code: '+964', phoneLength: 10, phonePattern: '[0-9]{10}', example: '1234567890' },
  { name: 'سوريا', code: '+963', phoneLength: 9, phonePattern: '[0-9]{9}', example: '123456789' },
  { name: 'المغرب', code: '+212', phoneLength: 9, phonePattern: '[0-9]{9}', example: '123456789' },
  { name: 'الجزائر', code: '+213', phoneLength: 9, phonePattern: '[0-9]{9}', example: '123456789' },
  { name: 'تونس', code: '+216', phoneLength: 8, phonePattern: '[0-9]{8}', example: '12345678' },
  { name: 'ليبيا', code: '+218', phoneLength: 9, phonePattern: '[0-9]{9}', example: '123456789' },
];

export default function TestPhoneValidation() {
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);

  const handleCountryChange = (countryName: string) => {
    const country = countries.find(c => c.name === countryName);
    setSelectedCountry(country);
    setPhoneNumber(''); // مسح رقم الهاتف عند تغيير الدولة
    setValidationResult(null);
  };

  const handlePhoneChange = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '');
    setPhoneNumber(numbersOnly);
    setValidationResult(null);
  };

  const validatePhone = () => {
    if (!selectedCountry) {
      setValidationResult({
        valid: false,
        message: 'يرجى اختيار الدولة أولاً'
      });
      return;
    }

    if (!phoneNumber) {
      setValidationResult({
        valid: false,
        message: 'يرجى إدخال رقم الهاتف'
      });
      return;
    }

    const phoneRegex = new RegExp(selectedCountry.phonePattern);
    const isValid = phoneRegex.test(phoneNumber);
    const isCorrectLength = phoneNumber.length === selectedCountry.phoneLength;

    setValidationResult({
      valid: isValid && isCorrectLength,
      message: isValid && isCorrectLength 
        ? `✅ رقم الهاتف صحيح للدولة ${selectedCountry.name}`
        : `❌ رقم الهاتف غير صحيح. يجب أن يكون ${selectedCountry.phoneLength} أرقام للدولة ${selectedCountry.name}`,
      details: {
        length: phoneNumber.length,
        requiredLength: selectedCountry.phoneLength,
        pattern: selectedCountry.phonePattern,
        fullNumber: `${selectedCountry.code}${phoneNumber}`
      }
    });
  };

  const fillExample = () => {
    if (selectedCountry) {
      setPhoneNumber(selectedCountry.example);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            اختبار أطوال أرقام الهاتف حسب الدولة
          </h1>
          
          <div className="space-y-6">
            {/* اختيار الدولة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اختر الدولة
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

            {/* إدخال رقم الهاتف */}
            {selectedCountry && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف ({selectedCountry.phoneLength} أرقام)
                </label>
                <div className="flex space-x-2">
                  <div className="flex items-center px-3 border border-gray-300 rounded-l-md bg-gray-50">
                    {selectedCountry.code}
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder={`أدخل ${selectedCountry.phoneLength} أرقام`}
                    maxLength={selectedCountry.phoneLength}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    مثال: {selectedCountry.example}
                  </p>
                  <button
                    onClick={fillExample}
                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    ملء المثال
                  </button>
                </div>
              </div>
            )}

            {/* زر التحقق */}
            {selectedCountry && (
              <button
                onClick={validatePhone}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                التحقق من صحة الرقم
              </button>
            )}

            {/* نتيجة التحقق */}
            {validationResult && (
              <div className={`p-4 rounded-md border ${
                validationResult.valid 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <h3 className={`font-medium mb-2 ${
                  validationResult.valid ? 'text-green-800' : 'text-red-800'
                }`}>
                  {validationResult.message}
                </h3>
                {validationResult.details && (
                  <div className="text-sm space-y-1">
                    <p><strong>الطول الحالي:</strong> {validationResult.details.length}</p>
                    <p><strong>الطول المطلوب:</strong> {validationResult.details.requiredLength}</p>
                    <p><strong>الرقم الكامل:</strong> {validationResult.details.fullNumber}</p>
                    <p><strong>النمط:</strong> {validationResult.details.pattern}</p>
                  </div>
                )}
              </div>
            )}

            {/* جدول أطوال أرقام الهاتف */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">أطوال أرقام الهاتف حسب الدولة</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-right border-b">الدولة</th>
                      <th className="px-4 py-2 text-right border-b">رمز الدولة</th>
                      <th className="px-4 py-2 text-right border-b">طول الرقم</th>
                      <th className="px-4 py-2 text-right border-b">مثال</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countries.map((country) => (
                      <tr key={country.code} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b">{country.name}</td>
                        <td className="px-4 py-2 border-b font-mono">{country.code}</td>
                        <td className="px-4 py-2 border-b text-center">{country.phoneLength}</td>
                        <td className="px-4 py-2 border-b font-mono text-sm">{country.example}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 