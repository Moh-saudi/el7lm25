'use client';

import React, { useState } from 'react';
import { getOTPMethod } from '@/lib/utils/otp-service-selector';
import DebugOTP from '@/components/shared/DebugOTP';

export default function TestOTPDebugPage() {
  const [showOTP, setShowOTP] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('+201234567890');
  const [selectedMethod, setSelectedMethod] = useState('');

  const handleShowOTP = () => {
    console.log('🔍 [DEBUG] Button clicked - showing OTP modal');
    
    // اختبار منطق اختيار نوع OTP
    const otpConfig = getOTPMethod(phoneNumber);
    setSelectedMethod(otpConfig.method);
    console.log('🔧 [DEBUG] Selected OTP method:', otpConfig.method);
    
    setShowOTP(true);
  };

  const handleOTPClose = () => {
    console.log('🔒 [DEBUG] OTP modal closed');
    setShowOTP(false);
  };

  const testMethodSelection = () => {
    const otpConfig = getOTPMethod(phoneNumber);
    console.log('🔧 [DEBUG] Testing method selection for:', phoneNumber);
    console.log('🔧 [DEBUG] Selected method:', otpConfig.method);
    alert(`النوع المختار: ${otpConfig.method}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">اختبار OTP</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">رقم الهاتف:</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="+201234567890"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={testMethodSelection}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
            >
              اختبار الاختيار
            </button>
            
            <button
              onClick={handleShowOTP}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              إرسال OTP
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>حالة النافذة: {showOTP ? 'مفتوحة' : 'مغلقة'}</p>
            <p>رقم الهاتف: {phoneNumber}</p>
            <p>النوع المختار: {selectedMethod}</p>
          </div>
        </div>
      </div>

      <DebugOTP
        phoneNumber={phoneNumber}
        isOpen={showOTP}
        onClose={handleOTPClose}
      />
    </div>
  );
} 