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

    // قراءة متغيرات البيئة
    const merchantPublicKey = process.env.GEIDEA_MERCHANT_PUBLIC_KEY;
    const apiPassword = process.env.GEIDEA_API_PASSWORD;
    const geideaApiUrl = process.env.GEIDEA_BASE_URL || 'https://api.merchant.geidea.net';

    // التحقق من وجود المفاتيح الحقيقية
    const isUsingRealCredentials = merchantPublicKey && apiPassword && 
        merchantPublicKey !== 'your_merchant_public_key_here' && 
        apiPassword !== 'your_api_password_here';
        
    if (!isUsingRealCredentials) {
      console.warn('⚠️ Geidea using test/placeholder credentials');
      
      // استخدام المفاتيح الموجودة (حتى لو كانت placeholders) لإنشاء الجلسة
      // Geidea ستتعامل مع هذا حسب إعداداتها
    }

    // إنشاء timestamp حسب الوثائق الرسمية
    const timestamp = new Date().toISOString();
    
    // إنشاء توقيع حسب الوثائق الرسمية
    const signature = generateSignature(
      merchantPublicKey || 'test_merchant',
      parseFloat(amount),
      currency,
      orderId,
      apiPassword || 'test_password',
      timestamp
    );

    // تحضير بيانات الجلسة حسب الوثائق الرسمية
    const sessionData: any = {
      amount: parseFloat(amount),
      currency: currency,
      merchantReferenceId: orderId,
      timestamp: timestamp,
      signature: signature,
      language: "ar"
    };

    // إضافة callbackUrl (مطلوب ويجب أن يكون HTTPS)
    const appBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    if (appBaseUrl.includes('localhost')) {
      // استخدم webhook.site للتطوير - هذا مقبول من Geidea
      sessionData.callbackUrl = 'https://webhook.site/c32729f0-39f0-4cf8-a8c2-e932a146b685';
    } else {
      sessionData.callbackUrl = `${appBaseUrl}/api/geidea/callback`;
    }

    console.log('🚀 Creating Geidea session with data:', {
      ...sessionData,
      signature: signature.substring(0, 8) + '...',
      isTestMode: !isUsingRealCredentials
    });

    // إرسال طلب إنشاء الجلسة إلى Geidea
    const response = await fetch(`${geideaApiUrl}/payment-intent/api/v2/direct/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${merchantPublicKey || 'test_merchant'}:${apiPassword || 'test_password'}`).toString('base64')}`
      },
      body: JSON.stringify(sessionData)
    });

    const responseData = await response.json();

    console.log('📨 Geidea response:', {
      status: response.status,
      responseCode: responseData.responseCode,
      sessionId: responseData.session?.id,
      isTestMode: !isUsingRealCredentials
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
      isTestMode: !isUsingRealCredentials
    });

  } catch (error) {
    console.error('💥 Error creating Geidea session:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 