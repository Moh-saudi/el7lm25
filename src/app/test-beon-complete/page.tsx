'use client';

import { useState } from 'react';
import beonSMSService from '@/lib/beon/sms-service';

export default function TestBeonComplete() {
  const [activeTab, setActiveTab] = useState('otp');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // OTP Tab State
  const [otpPhone, setOtpPhone] = useState('+201122652572');
  const [otpName, setOtpName] = useState('gouda');
  const [otpLength, setOtpLength] = useState(4);
  const [otpLang, setOtpLang] = useState('ar');

  // SMS Tab State
  const [smsPhone, setSmsPhone] = useState('+201022337332');
  const [smsMessage, setSmsMessage] = useState('test beon');
  const [smsName, setSmsName] = useState('BeOn Sales');

  // Template Tab State
  const [templatePhone, setTemplatePhone] = useState('+20112');
  const [templateName, setTemplateName] = useState('ahmed');
  const [templateId, setTemplateId] = useState(133);
  const [templateVars, setTemplateVars] = useState('1,2');

  // Bulk Tab State
  const [bulkPhones, setBulkPhones] = useState('+201122652572');
  const [bulkMessage, setBulkMessage] = useState('hello from beon sms api');

  const handleSendOTP = async () => {
    // منع الإرسال المتكرر
    if (loading) {
      console.log('🛑 BeOn OTP sending blocked - already loading');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formattedPhone = beonSMSService.formatPhoneNumber(otpPhone);
      
      if (!beonSMSService.validatePhoneNumber(formattedPhone)) {
        setError('رقم الهاتف غير صحيح');
        setLoading(false);
        return;
      }

      console.log('📱 Sending OTP to:', formattedPhone);
      const response = await beonSMSService.sendOTPNew(formattedPhone, otpName, otpLength, otpLang);
      
      setResult(response);
      
      if (response.success) {
        console.log('✅ OTP sent successfully!');
      } else {
        setError(response.error || 'فشل في إرسال OTP');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const handleSendSMS = async () => {
    // منع الإرسال المتكرر
    if (loading) {
      console.log('🛑 BeOn SMS sending blocked - already loading');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formattedPhone = beonSMSService.formatPhoneNumber(smsPhone);
      
      if (!beonSMSService.validatePhoneNumber(formattedPhone)) {
        setError('رقم الهاتف غير صحيح');
        setLoading(false);
        return;
      }

      console.log('📱 Sending SMS to:', formattedPhone);
      const response = await beonSMSService.sendSMS(formattedPhone, smsMessage);
      
      setResult(response);
      
      if (response.success) {
        console.log('✅ SMS sent successfully!');
      } else {
        setError(response.error || 'فشل في إرسال SMS');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTemplate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formattedPhone = beonSMSService.formatPhoneNumber(templatePhone);
      
      if (!beonSMSService.validatePhoneNumber(formattedPhone)) {
        setError('رقم الهاتف غير صحيح');
        return;
      }

      const vars = templateVars.split(',').map(v => v.trim());
      const otp = beonSMSService.generateOTP();

      console.log('📱 Sending Template SMS to:', formattedPhone);
      const response = await beonSMSService.sendOTP(formattedPhone, templateId, otp, templateName);
      
      setResult(response);
      
      if (response.success) {
        console.log('✅ Template SMS sent successfully!');
      } else {
        setError(response.error || 'فشل في إرسال Template SMS');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const handleSendBulk = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const phoneNumbers = bulkPhones.split(',').map(p => beonSMSService.formatPhoneNumber(p.trim()));
      
      // التحقق من صحة جميع الأرقام
      for (const phone of phoneNumbers) {
        if (!beonSMSService.validatePhoneNumber(phone)) {
          setError(`رقم الهاتف غير صحيح: ${phone}`);
          return;
        }
      }

      console.log('📱 Sending Bulk SMS to:', phoneNumbers);
      const response = await beonSMSService.sendBulkSMS(phoneNumbers, bulkMessage);
      
      setResult(response);
      
      if (response.success) {
        console.log('✅ Bulk SMS sent successfully!');
      } else {
        setError(response.error || 'فشل في إرسال Bulk SMS');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'otp', name: 'OTP الجديد', icon: '🔐' },
    { id: 'sms', name: 'SMS عادي', icon: '💬' },
    { id: 'template', name: 'SMS Template', icon: '📋' },
    { id: 'bulk', name: 'Bulk SMS', icon: '📢' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="border-b border-gray-200">
            <div className="px-6 py-4">
              <h1 className="text-2xl font-bold text-gray-900 text-center">
                اختبار شامل - جميع خدمات BeOn
              </h1>
              <p className="text-gray-600 text-center mt-2">
                اختبار جميع أنواع الخدمات المتاحة في BeOn API
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* OTP Tab */}
            {activeTab === 'otp' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">إرسال OTP (API الجديد)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                    <input
                      type="text"
                      value={otpPhone}
                      onChange={(e) => setOtpPhone(e.target.value)}
                      placeholder="+201122652572"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الاسم</label>
                    <input
                      type="text"
                      value={otpName}
                      onChange={(e) => setOtpName(e.target.value)}
                      placeholder="gouda"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">طول OTP</label>
                    <select
                      value={otpLength}
                      onChange={(e) => setOtpLength(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value={4}>4 أرقام</option>
                      <option value={6}>6 أرقام</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">اللغة</label>
                    <select
                      value={otpLang}
                      onChange={(e) => setOtpLang(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'جاري الإرسال...' : 'إرسال OTP'}
                </button>
              </div>
            )}

            {/* SMS Tab */}
            {activeTab === 'sms' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">إرسال SMS عادي</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                    <input
                      type="text"
                      value={smsPhone}
                      onChange={(e) => setSmsPhone(e.target.value)}
                      placeholder="+201022337332"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">اسم المرسل</label>
                    <input
                      type="text"
                      value={smsName}
                      onChange={(e) => setSmsName(e.target.value)}
                      placeholder="BeOn Sales"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الرسالة</label>
                  <textarea
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    placeholder="test beon"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <button
                  onClick={handleSendSMS}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'جاري الإرسال...' : 'إرسال SMS'}
                </button>
              </div>
            )}

            {/* Template Tab */}
            {activeTab === 'template' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">إرسال SMS Template</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                    <input
                      type="text"
                      value={templatePhone}
                      onChange={(e) => setTemplatePhone(e.target.value)}
                      placeholder="+20112"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الاسم</label>
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="ahmed"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Template ID</label>
                    <input
                      type="number"
                      value={templateId}
                      onChange={(e) => setTemplateId(Number(e.target.value))}
                      placeholder="133"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">المتغيرات (مفصولة بفواصل)</label>
                    <input
                      type="text"
                      value={templateVars}
                      onChange={(e) => setTemplateVars(e.target.value)}
                      placeholder="1,2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSendTemplate}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'جاري الإرسال...' : 'إرسال Template SMS'}
                </button>
              </div>
            )}

            {/* Bulk Tab */}
            {activeTab === 'bulk' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">إرسال Bulk SMS</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">أرقام الهاتف (مفصولة بفواصل)</label>
                  <input
                    type="text"
                    value={bulkPhones}
                    onChange={(e) => setBulkPhones(e.target.value)}
                    placeholder="+201122652572,+201022337332"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الرسالة</label>
                  <textarea
                    value={bulkMessage}
                    onChange={(e) => setBulkMessage(e.target.value)}
                    placeholder="hello from beon sms api"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <button
                  onClick={handleSendBulk}
                  disabled={loading}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  {loading ? 'جاري الإرسال...' : 'إرسال Bulk SMS'}
                </button>
              </div>
            )}

            {/* Results */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <h3 className="text-sm font-medium text-red-800 mb-2">خطأ:</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {result && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="text-sm font-medium text-green-800 mb-2">النتيجة:</h3>
                <pre className="text-sm text-green-700 whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            {/* API Info */}
            <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
              <h3 className="text-sm font-medium text-gray-800 mb-2">معلومات API:</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>OTP API:</strong> https://beon.chat/api/send/message/otp (Token: vSCuMzZwLjDxzR882YphwEgW)</p>
                <p><strong>SMS API:</strong> https://beon.chat/api/send/message/sms (Token: SPb4sgedfe)</p>
                <p><strong>Template API:</strong> https://beon.chat/api/send/message/sms/template (Token: SPb4sbemr5bwb7sjzCqTcL)</p>
                <p><strong>Bulk API:</strong> https://beon.chat/api/send/message/sms/bulk (Token: nzQ7ytW8q6yfQdJRFM57yRfR)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 