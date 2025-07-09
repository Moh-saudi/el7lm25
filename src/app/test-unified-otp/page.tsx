'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Globe,
  Info
} from 'lucide-react';
import UnifiedOTPVerification from '@/components/shared/UnifiedOTPVerification';
import { getOTPMethod, getCountryName, getOTPMessage } from '@/lib/utils/otp-service-selector';
import { toast } from 'sonner';

export default function TestUnifiedOTPPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otpMethod, setOtpMethod] = useState<any>(null);
  const [countryName, setCountryName] = useState('');
  const [verificationResult, setVerificationResult] = useState<string>('');

  // تحليل رقم الهاتف عند التغيير
  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    
    if (value) {
      try {
        const method = getOTPMethod(value);
        const countryCode = value.match(/^\+\d{1,4}/)?.[0] || '';
        const country = getCountryName(countryCode);
        
        setOtpMethod(method);
        setCountryName(country);
      } catch (error) {
        console.error('Error parsing phone number:', error);
      }
    } else {
      setOtpMethod(null);
      setCountryName('');
    }
  };

  // بدء عملية التحقق
  const handleStartVerification = () => {
    if (!phoneNumber.trim()) {
      toast.error('يرجى إدخال رقم الهاتف');
      return;
    }

    if (!otpMethod) {
      toast.error('رقم الهاتف غير صحيح');
      return;
    }

    setShowOTP(true);
    setVerificationResult('');
  };

  // التعامل مع نجاح التحقق
  const handleVerificationSuccess = (verifiedPhone: string) => {
    setVerificationResult('success');
    toast.success('تم التحقق بنجاح!');
    setShowOTP(false);
  };

  // التعامل مع فشل التحقق
  const handleVerificationFailed = (error: string) => {
    setVerificationResult('failed');
    toast.error(`فشل في التحقق: ${error}`);
    setShowOTP(false);
  };

  // إغلاق نافذة OTP
  const handleCloseOTP = () => {
    setShowOTP(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        {/* العنوان */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">اختبار نظام OTP الموحد</h1>
          <p className="text-gray-600">
            اختبار النظام الجديد الذي يدعم SMS و WhatsApp حسب الدولة
          </p>
        </div>

        {/* نموذج الإدخال */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              إدخال معلومات الهاتف
            </CardTitle>
            <CardDescription>
              أدخل رقم الهاتف واسمك لاختبار نظام التحقق
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">الاسم (اختياري)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+966501234567"
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                مثال: +966501234567 أو +201234567890
              </p>
            </div>

            <Button 
              onClick={handleStartVerification}
              disabled={!phoneNumber.trim() || !otpMethod}
              className="w-full"
            >
              بدء التحقق
            </Button>
          </CardContent>
        </Card>

        {/* معلومات التحليل */}
        {otpMethod && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                تحليل رقم الهاتف
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">الدولة</p>
                  <p className="font-medium">{countryName}</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">طريقة التحقق</p>
                  <Badge 
                    variant={otpMethod.method === 'sms' ? 'default' : 'secondary'}
                    className="mt-1"
                  >
                    {otpMethod.method === 'sms' ? 'SMS' : 'WhatsApp'}
                  </Badge>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  {getOTPMessage(otpMethod.method, countryName)}
                </p>
              </div>

              {otpMethod.fallbackMethod && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    الطريقة البديلة: {otpMethod.fallbackMethod === 'sms' ? 'SMS' : 'WhatsApp'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* نتيجة التحقق */}
        {verificationResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {verificationResult === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                نتيجة التحقق
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className={verificationResult === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                {verificationResult === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={verificationResult === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {verificationResult === 'success' 
                    ? 'تم التحقق من رقم الهاتف بنجاح!' 
                    : 'فشل في التحقق من رقم الهاتف'
                  }
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* معلومات إضافية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              معلومات النظام
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">الدول العربية</h4>
                <p className="text-sm text-green-700">
                  تستخدم SMS عبر BeOn (API الجديد)
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">الدول الأخرى</h4>
                <p className="text-sm text-blue-700">
                  تستخدم WhatsApp Business API
                </p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">ميزات النظام</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• تحديد تلقائي لطريقة التحقق حسب الدولة</li>
                <li>• دعم SMS للدول العربية عبر BeOn</li>
                <li>• دعم WhatsApp للدول الأخرى</li>
                <li>• إمكانية التبديل بين الطريقتين</li>
                <li>• تحقق من صحة رقم الهاتف</li>
                <li>• عد تنازلي وإعادة إرسال</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* مكون OTP الموحد */}
      <UnifiedOTPVerification
        phoneNumber={phoneNumber}
        name={name}
        isOpen={showOTP}
        onVerificationSuccess={handleVerificationSuccess}
        onVerificationFailed={handleVerificationFailed}
        onClose={handleCloseOTP}
        title="التحقق من رقم الهاتف"
        otpExpirySeconds={30}
        maxAttempts={3}
      />
    </div>
  );
} 