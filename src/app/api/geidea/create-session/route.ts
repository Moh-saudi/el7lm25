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

    const { amount, currency = 'USD', orderId, customerEmail, customerName } = body;

    // التحقق من وجود البيانات المطلوبة
    if (!amount || !orderId || !customerEmail) {
      console.error('❌ [Geidea API] Missing required fields:', { amount, orderId, customerEmail });
      return NextResponse.json(
        { error: 'Missing required fields: amount, orderId, customerEmail', details: { amount, orderId, customerEmail } },
        { status: 400 }
      );
    }

    // قراءة متغيرات البيئة (بدون fallback للمفاتيح الحقيقية)
    const merchantPublicKey = process.env.GEIDEA_MERCHANT_PUBLIC_KEY;
    const apiPassword = process.env.GEIDEA_API_PASSWORD;
    const geideaApiUrl = process.env.GEIDEA_BASE_URL || 'https://api.merchant.geidea.net';

    // التحقق من وجود المفاتيح في متغيرات البيئة
    if (!merchantPublicKey || !apiPassword) {
      console.warn('⚠️ [Geidea API] Missing credentials in environment variables');
      
      // إنشاء mock session للتطوير بدلاً من الاتصال بـ Geidea مع credentials خاطئة
      const mockSessionId = `dev_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('🧪 [Geidea API] Development mode - creating mock session:', mockSessionId);
      
      return NextResponse.json({
        success: true,
        sessionId: mockSessionId,
        redirectUrl: `#mock-payment-${mockSessionId}`,
        merchantReferenceId: orderId,
        message: 'Development mock session created successfully (missing credentials)',
        isTestMode: true,
        isDevelopmentMode: true
      });
    }

    // التحقق من أن المفاتيح ليست placeholder values
    if (merchantPublicKey.includes('your_') || apiPassword.includes('your_')) {
      console.warn('⚠️ [Geidea API] Placeholder credentials detected');
      
      const mockSessionId = `placeholder_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return NextResponse.json({
        success: true,
        sessionId: mockSessionId,
        redirectUrl: `#mock-payment-${mockSessionId}`,
        merchantReferenceId: orderId,
        message: 'Mock session created (placeholder credentials detected)',
        isTestMode: true,
        isDevelopmentMode: true
      });
    }

    // Debug: طباعة معلومات المفاتيح (بدون كشف القيم الفعلية)
    console.log('🔍 [Geidea Debug] Environment check:', {
      merchantPublicKey: merchantPublicKey ? `${merchantPublicKey.substring(0, 8)}...` : 'NOT SET',
      apiPassword: apiPassword ? `${apiPassword.substring(0, 8)}...` : 'NOT SET',
      hasValidCredentials: !!(merchantPublicKey && apiPassword)
    });

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

    // تحضير بيانات الجلسة حسب الوثائق الرسمية - للإنتاج الحقيقي
    const isTestMode = false; // ✅ تم تفعيل الوضع الحقيقي - لا اختبار
    
    const sessionData: any = {
      amount: parseFloat(amount),
      currency: currency,
      // ✅ إعدادات الإنتاج الحقيقي
      isTestMode: isTestMode,
      testMode: isTestMode,
      sandbox: isTestMode,
      test: isTestMode,
      environment: 'production', // ✅ وضع الإنتاج الحقيقي
      mode: 'live', // ✅ وضع مباشر للدفعات الحقيقية
      merchantReferenceId: orderId,
      timestamp: timestamp,
      signature: signature,
      language: "ar"
    };

    // إضافة callbackUrl (مطلوب ويجب أن يكون HTTPS)
    const appBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    
    let callbackUrl = `${appBaseUrl}/api/geidea/callback`;
    
    // للتطوير المحلي، استخدم webhook.site
    if (appBaseUrl.includes('localhost')) {
      callbackUrl = 'https://webhook.site/c32729f0-39f0-4cf8-a8c2-e932a146b685';
    }
    
    sessionData.callbackUrl = callbackUrl;
    
    // إضافة domain whitelist لـ Geidea security
    sessionData.allowedDomains = [
      process.env.VERCEL_URL,
      'localhost:3000'
    ].filter(Boolean);

    console.log('🚀 💳 Creating Geidea LIVE session with credentials:', {
      amount: sessionData.amount,
      currency: sessionData.currency,
      merchantReferenceId: sessionData.merchantReferenceId,
      callbackUrl: sessionData.callbackUrl,
      environment: sessionData.environment,
      isTestMode: sessionData.isTestMode,
      testMode: sessionData.testMode,
      mode: sessionData.mode,
      signature: signature.substring(0, 8) + '...'
    });

    // إرسال طلب إنشاء الجلسة إلى Geidea
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
    console.log('✅ 💳 LIVE MODE: Payment session created successfully!');
    return NextResponse.json({
      success: true,
      sessionId: responseData.session?.id,
      redirectUrl: responseData.session?.redirectUrl,
      merchantReferenceId: orderId,
      message: '💳 LIVE MODE: Payment session created successfully',
      isTestMode: false, // وضع الإنتاج الحقيقي
      testEnvironment: false,
      environment: 'production'
    });

  } catch (error) {
    console.error('💥 Error creating Geidea session:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
