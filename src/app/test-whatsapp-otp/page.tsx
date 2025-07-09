'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, MessageSquare, Smartphone } from 'lucide-react';
import WhatsAppOTPVerification from '@/components/shared/WhatsAppOTPVerification';

export default function TestWhatsAppOTP() {
  const [phoneNumber, setPhoneNumber] = useState('+966501234567');
  const [name, setName] = useState('Test User');
  const [showOTP, setShowOTP] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testWhatsAppAPI = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const generatedOtp = Math.random().toString().substring(2, 8);
      
      console.log('🧪 Testing WhatsApp API with:', {
        phone: phoneNumber,
        otp: generatedOtp,
        name
      });

      const response = await fetch('/api/notifications/whatsapp/beon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          otp: generatedOtp,
          name
        })
      });

      const result = await response.json();
      console.log('🧪 API Response:', result);
      
      setTestResult({
        success: response.ok,
        status: response.status,
        data: result
      });
      
    } catch (error: any) {
      console.error('🧪 Test error:', error);
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = (phone: string) => {
    console.log('✅ Verification successful for:', phone);
    setShowOTP(false);
  };

  const handleVerificationFailed = (error: string) => {
    console.error('❌ Verification failed:', error);
    setShowOTP(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">WhatsApp OTP Test</h1>
        <p className="text-gray-600">
          Test the WhatsApp OTP functionality with different phone numbers and configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              API Test
            </CardTitle>
            <CardDescription>
              Test the WhatsApp API directly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+966501234567"
              />
            </div>
            
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Test User"
              />
            </div>

            <Button 
              onClick={testWhatsAppAPI} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test WhatsApp API'}
            </Button>

            {testResult && (
              <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={testResult.success ? "text-green-800" : "text-red-800"}>
                  <div className="font-semibold">
                    {testResult.success ? 'API Test Successful' : 'API Test Failed'}
                  </div>
                  <div className="text-sm mt-1">
                    Status: {testResult.status || 'N/A'}
                  </div>
                  {testResult.data && (
                    <div className="text-sm mt-2">
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(testResult.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* OTP Component Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-green-600" />
              OTP Component Test
            </CardTitle>
            <CardDescription>
              Test the WhatsApp OTP verification component
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone2">Phone Number</Label>
              <Input
                id="phone2"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+966501234567"
              />
            </div>
            
            <div>
              <Label htmlFor="name2">Name</Label>
              <Input
                id="name2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Test User"
              />
            </div>

            <Button 
              onClick={() => setShowOTP(true)} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Open OTP Verification
            </Button>

            <div className="text-sm text-gray-600">
              <p>• Egyptian numbers (+20) will use SMS</p>
              <p>• Other numbers will use WhatsApp</p>
              <p>• Check browser console for detailed logs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      {testResult && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>Phone Number:</strong> {phoneNumber}
              </div>
              <div>
                <strong>Name:</strong> {name}
              </div>
              <div>
                <strong>Method:</strong> {phoneNumber.startsWith('+20') ? 'SMS (Egypt)' : 'WhatsApp'}
              </div>
              <div>
                <strong>Status:</strong> {testResult.success ? '✅ Success' : '❌ Failed'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* WhatsApp OTP Verification Modal */}
      <WhatsAppOTPVerification
        phoneNumber={phoneNumber}
        name={name}
        isOpen={showOTP}
        onVerificationSuccess={handleVerificationSuccess}
        onVerificationFailed={handleVerificationFailed}
        onClose={() => setShowOTP(false)}
        title="اختبار التحقق من رقم الهاتف"
        subtitle="سيتم إرسال رمز التحقق عبر WhatsApp أو SMS"
      />
    </div>
  );
} 