import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// إنشاء توقيع للطلب حسب الوثائق الرسمية
function generateSignature(
  merchantPublicKey: string,
  amount: number,
  currency: string,
  merchantReferenceId: string,
  apiPassword: string,
  timestamp: string
): string {
  const amountStr = amount.toFixed(2);
  const data = `${merchantPublicKey}${amountStr}${currency}${merchantReferenceId}${timestamp}`;
  return crypto
    .createHmac('sha256', apiPassword)
    .update(data)
    .digest('base64');
}

export async function POST(request: NextRequest) {
  try {
    // قراءة البيانات من الطلب
    let body;
    try {
      body = await request.json();
      console.log('📥 [Geidea API] Received body:', body);
    } catch (err) {
      console.error('❌ [Geidea API] Failed to parse JSON body:', err);
      return NextResponse.json(
        { error: 'Invalid JSON body', details: err instanceof Error ? err.message : 'Unknown error' },
        { status: 400 }
      );
    }

    const { amount, currency = 'SAR', orderId, customerEmail, customerName } = body;

    // التحقق من وجود البيانات المطلوبة
    if (!amount || !orderId || !customerEmail) {
      console.error('❌ [Geidea API] Missing required fields:', { amount, orderId, customerEmail });
      return NextResponse.json(
        { error: 'Missing required fields: amount, orderId, customerEmail', details: { amount, orderId, customerEmail } },
        { status: 400 }
      );
    }

    // قراءة متغيرات البيئة مع fallback للمفاتيح الحقيقية
      const merchantPublicKey = process.env.GEIDEA_MERCHANT_PUBLIC_KEY || '3448c010-87b1-41e7-9771-cac444268cfb';
  const apiPassword = process.env.GEIDEA_API_PASSWORD || 'edfd5eee-fd1b-4932-9ee1-d6d9ba7599f0';
    const geideaApiUrl = process.env.GEIDEA_BASE_URL || 'https://api.merchant.geidea.net';

    // Debug: طباعة المفاتيح للتحقق
    console.log('🔍 [Geidea Debug] Environment check:', {
      merchantPublicKey: merchantPublicKey ? `${merchantPublicKey.substring(0, 8)}...` : 'NOT SET',
      apiPassword: apiPassword ? `${apiPassword.substring(0, 8)}...` : 'NOT SET',
      hasRealKey: merchantPublicKey === '3448c010-87b1-41e7-9771-cac444268cfb',
      hasRealPassword: apiPassword === 'edfd5eee-fd1b-4932-9ee1-d6d9ba7599f0'
    });

    // التحقق من وجود المفاتيح الحقيقية
    const isUsingRealCredentials = merchantPublicKey === '3448c010-87b1-41e7-9771-cac444268cfb' && 
        apiPassword === 'edfd5eee-fd1b-4932-9ee1-d6d9ba7599f0';
        
    console.log('🔑 [Geidea Debug] Credentials check:', {
      isUsingRealCredentials,
      willUseMockSession: !isUsingRealCredentials
    });
        
    if (!isUsingRealCredentials) {
      console.warn('⚠️ Geidea credentials missing - creating mock session for development');
      
      // إنشاء mock session للتطوير بدلاً من الاتصال بـ Geidea مع credentials خاطئة
      const mockSessionId = `dev_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('🧪 [Geidea API] Development mode - creating mock session:', mockSessionId);
      
      return NextResponse.json({
        success: true,
        sessionId: mockSessionId,
        redirectUrl: `#mock-payment-${mockSessionId}`,
        merchantReferenceId: orderId,
        message: 'Development mock session created successfully',
        isTestMode: false,
        isDevelopmentMode: true
      });
    }

    // إنشاء timestamp حسب الوثائق الرسمية
    const timestamp = new Date().toISOString();
    
    // إنشاء توقيع حسب الوثائق الرسمية
    const signature = generateSignature(
      merchantPublicKey,
      parseFloat(amount),
      currency,
      orderId,
      apiPassword,
      timestamp
    );

    // تحضير بيانات الجلسة حسب الوثائق الرسمية
    const sessionData: any = {
      amount: parseFloat(amount),
      currency: currency,
    isTestMode: false,
    testMode: false,
    sandbox: false,
    environment: 'production',
    mode: 'live',
      merchantReferenceId: orderId,
      timestamp: timestamp,
      signature: signature,
      language: "ar"
    };

    // إضافة callbackUrl (مطلوب ويجب أن يكون HTTPS)
    const appBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://dream-cyaco2n7l-mohamedsaudis-projects.vercel.app';
    
    // تأكد من استخدام الـ production URL
    let callbackUrl = `${appBaseUrl}/api/geidea/callback`;
    
    // للتطوير المحلي، استخدم webhook.site
    if (appBaseUrl.includes('localhost')) {
      callbackUrl = 'https://webhook.site/c32729f0-39f0-4cf8-a8c2-e932a146b685';
    }
    
    sessionData.callbackUrl = callbackUrl;
    
    // إضافة domain whitelist لـ Geidea security
    sessionData.allowedDomains = [
      'dream-o8xvlgsby-mohamedsaudis-projects.vercel.app',
      'dream-cyaco2n7l-mohamedsaudis-projects.vercel.app',
      'localhost:3000'
    ];

    console.log('🚀 Creating Geidea session with REAL credentials:', {
      amount: sessionData.amount,
      currency: sessionData.currency,
      merchantReferenceId: sessionData.merchantReferenceId,
      callbackUrl: sessionData.callbackUrl,
      signature: signature.substring(0, 8) + '...'
    });
    
    console.log('📋 Full sessionData payload:', JSON.stringify(sessionData, null, 2));
    console.log('🔗 Geidea API URL:', `${geideaApiUrl}/payment/api/v1/hpp/session`);

    // إرسال طلب إنشاء الجلسة إلى Geidea مع المفاتيح الحقيقية فقط
    const response = await fetch(`${geideaApiUrl}/payment-intent/api/v2/direct/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${merchantPublicKey}:${apiPassword}`).toString('base64')}`
      },
      body: JSON.stringify(sessionData)
    });

    const responseData = await response.json();

    console.log('📨 Geidea response:', {
      status: response.status,
      responseCode: responseData.responseCode,
      sessionId: responseData.session?.id
    });

    if (!response.ok || responseData.responseCode !== '000') {
      console.error('❌ Geidea API error:', responseData);
      return NextResponse.json(
        { 
          error: 'Failed to create payment session',
          details: responseData.detailedResponseMessage || responseData.responseMessage || 'Unknown error'
        },
        { status: response.status }
      );
    }

    // إرجاع بيانات الجلسة الناجحة
    console.log('✅ Payment session created successfully!');
    return NextResponse.json({
      success: true,
      sessionId: responseData.session?.id,
      redirectUrl: responseData.session?.redirectUrl,
      merchantReferenceId: orderId,
      message: 'Payment session created successfully',
      isTestMode: false
    });

  } catch (error) {
    console.error('💥 Error creating Geidea session:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 