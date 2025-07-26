'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';

interface TestResult {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: Date;
}

export default function TestSmartOTPPage() {
  const [phoneNumber, setPhoneNumber] = useState('+966501234567');
  const [name, setName] = useState('أحمد محمد');
  const [country, setCountry] = useState('السعودية');
  const [countryCode, setCountryCode] = useState('+966');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const countries = [
    { name: 'السعودية', code: '+966' },
    { name: 'الإمارات', code: '+971' },
    { name: 'الكويت', code: '+965' },
    { name: 'قطر', code: '+974' },
    { name: 'البحرين', code: '+973' },
    { name: 'عمان', code: '+968' },
    { name: 'مصر', code: '+20' },
    { name: 'الأردن', code: '+962' },
    { name: 'لبنان', code: '+961' },
    { name: 'العراق', code: '+964' },
    { name: 'سوريا', code: '+963' },
    { name: 'المغرب', code: '+212' },
    { name: 'الجزائر', code: '+213' },
    { name: 'تونس', code: '+216' },
    { name: 'ليبيا', code: '+218' },
  ];

  const addResult = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const newResult: TestResult = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date()
    };
    setResults(prev => [newResult, ...prev]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const handleCountryChange = (countryName: string) => {
    const selectedCountry = countries.find(c => c.name === countryName);
    if (selectedCountry) {
      setCountry(countryName);
      setCountryCode(selectedCountry.code);
      
      // تحديث رقم الهاتف حسب الدولة
      if (countryName === 'مصر') {
        setPhoneNumber('+201234567890');
      } else if (countryName === 'قطر') {
        setPhoneNumber('+97412345678');
      } else if (countryName === 'السعودية') {
        setPhoneNumber('+966501234567');
      } else {
        setPhoneNumber(`${selectedCountry.code}123456789`);
      }
    }
  };

  const testSmartOTP = async () => {
    setLoading(true);
    addResult('🚀 بدء اختبار الخدمة الذكية...', 'info');
    
    try {
      const response = await fetch('/api/notifications/smart-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          name,
          country,
          countryCode
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        addResult('✅ تم إرسال OTP بنجاح', 'success');
        addResult(`📞 الرقم: ${data.phoneNumber}`, 'info');
        addResult(`🌍 الدولة: ${data.country}`, 'info');
        addResult(`🔢 OTP المرسل: ${data.otp}`, 'info');
        
        if (data.method === 'both') {
          addResult('📱 تم الإرسال عبر WhatsApp و SMS (مصر)', 'success');
        } else if (data.method === 'whatsapp') {
          addResult('📱 تم الإرسال عبر WhatsApp فقط', 'success');
        } else if (data.method === 'sms') {
          addResult('📱 تم الإرسال عبر SMS فقط', 'success');
        }
        
        if (data.fallback) {
          addResult('⚠️ تم استخدام طريقة بديلة', 'warning');
        }
      } else {
        addResult(`❌ فشل في إرسال OTP: ${data.error}`, 'error');
      }
    } catch (error: any) {
      addResult(`❌ خطأ في الاختبار: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const testAllCountries = async () => {
    setLoading(true);
    clearResults();
    addResult('🌍 بدء اختبار جميع الدول...', 'info');
    
    for (const country of countries) {
      addResult(`📱 اختبار ${country.name}...`, 'info');
      
      try {
        const testPhone = country.name === 'مصر' ? '+201234567890' : 
                         country.name === 'قطر' ? '+97412345678' : 
                         country.name === 'السعودية' ? '+966501234567' : 
                         `${country.code}123456789`;
        
        const response = await fetch('/api/notifications/smart-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: testPhone,
            name: 'اختبار',
            country: country.name,
            countryCode: country.code
          })
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          addResult(`✅ ${country.name}: ${data.method === 'both' ? 'WhatsApp + SMS' : data.method}`, 'success');
        } else {
          addResult(`❌ ${country.name}: فشل`, 'error');
        }
      } catch (error: any) {
        addResult(`❌ ${country.name}: خطأ`, 'error');
      }
      
      // انتظار قليلاً بين الاختبارات
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    addResult('🏁 انتهى اختبار جميع الدول', 'info');
    setLoading(false);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            🧠 اختبار الخدمة الذكية للـ OTP
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* إعدادات الاختبار */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">⚙️ إعدادات الاختبار</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الدولة
                </label>
                <select
                  value={country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="رقم الهاتف"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="الاسم"
                />
              </div>
            </div>

            {/* معلومات المنطق */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">📋 منطق الإرسال</h2>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">🌍 جميع الدول:</h3>
                <p className="text-blue-700 text-sm">إرسال OTP عبر WhatsApp فقط</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">🇪🇬 مصر فقط:</h3>
                <p className="text-green-700 text-sm">إرسال OTP عبر WhatsApp و SMS معاً</p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">🔄 البديل:</h3>
                <p className="text-yellow-700 text-sm">إذا فشل WhatsApp، يتم إرسال SMS كبديل</p>
              </div>
            </div>
          </div>

          {/* أزرار الاختبار */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={testSmartOTP}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              🧠 اختبار الخدمة الذكية
            </button>
            
            <button
              onClick={testAllCountries}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              🌍 اختبار جميع الدول
            </button>
            
            <button
              onClick={clearResults}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              🗑️ مسح النتائج
            </button>
          </div>
        </div>

        {/* النتائج */}
        <div className="bg-white rounded-xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">📊 النتائج</h2>
          
          {results.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              لا توجد نتائج بعد. ابدأ الاختبار لرؤية النتائج.
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                >
                  {getResultIcon(result.type)}
                  <div className="flex-1">
                    <p className="text-sm">{result.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {result.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 