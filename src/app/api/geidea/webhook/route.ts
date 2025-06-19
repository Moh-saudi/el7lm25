import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import crypto from 'crypto';

// تكوين Geidea
const GEIDEA_CONFIG = {
  webhookSecret: process.env.GEIDEA_WEBHOOK_SECRET || '',
  baseUrl: process.env.GEIDEA_BASE_URL || 'https://api.merchant.geidea.net'
};

// التحقق من صحة التوقيع
function verifySignature(payload: string, signature: string): boolean {
  if (!GEIDEA_CONFIG.webhookSecret) {
    console.warn('GEIDEA_WEBHOOK_SECRET غير محدد');
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', GEIDEA_CONFIG.webhookSecret)
      .update(payload, 'utf8')
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('خطأ في التحقق من التوقيع:', error);
    return false;
  }
}

// معالجة webhook
async function handleWebhook(payload: any) {
  const { 
    orderId, 
    merchantReferenceId, 
    status, 
    amount, 
    currency,
    customerEmail,
    paymentMethod,
    transactionId,
    timestamp 
  } = payload;

  console.log('📥 Webhook received:', {
    orderId,
    merchantReferenceId,
    status,
    amount,
    currency,
    customerEmail,
    paymentMethod,
    transactionId,
    timestamp
  });

  try {
    // تحديث حالة الدفع في قاعدة البيانات
    if (merchantReferenceId) {
      // هنا يمكنك تحديث حالة الدفع في Firestore أو أي قاعدة بيانات أخرى
      console.log('✅ Payment status updated:', {
        merchantReferenceId,
        status,
        orderId,
        transactionId
      });
    }

    // إرسال تأكيد بالبريد الإلكتروني (اختياري)
    if (customerEmail && status === 'SUCCESS') {
      console.log('📧 Sending confirmation email to:', customerEmail);
      // هنا يمكنك إرسال تأكيد بالبريد الإلكتروني
    }

    return { success: true, message: 'Webhook processed successfully' };
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return { success: false, error: 'Failed to process webhook' };
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Geidea webhook received');

    // قراءة البيانات
    const body = await request.text();
    const signature = request.headers.get('x-geidea-signature');

    console.log('📋 Webhook headers:', {
      'content-type': request.headers.get('content-type'),
      'x-geidea-signature': signature,
      'user-agent': request.headers.get('user-agent')
    });

    // التحقق من التوقيع
    if (!signature) {
      console.error('❌ Missing signature header');
      return NextResponse.json(
        { error: 'Missing signature header' },
        { status: 400 }
      );
    }

    if (!verifySignature(body, signature)) {
      console.error('❌ Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // تحليل البيانات
    let payload;
    try {
      payload = JSON.parse(body);
    } catch (error) {
      console.error('❌ Invalid JSON payload:', error);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // التحقق من البيانات المطلوبة
    if (!payload.orderId || !payload.merchantReferenceId || !payload.status) {
      console.error('❌ Missing required fields:', payload);
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // معالجة Webhook
    const result = await handleWebhook(payload);

    if (result.success) {
      console.log('✅ Webhook processed successfully');
      return NextResponse.json(
        { message: 'Webhook processed successfully' },
        { status: 200 }
      );
    } else {
      console.error('❌ Webhook processing failed:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Unexpected error in webhook handler:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// للاختبار فقط - لا تستخدم في الإنتاج
export async function GET(request: NextRequest) {
  console.log('🔍 Webhook endpoint test');
  
  return NextResponse.json({
    message: 'Geidea webhook endpoint is working',
    timestamp: new Date().toISOString(),
    config: {
      hasWebhookSecret: !!GEIDEA_CONFIG.webhookSecret,
      baseUrl: GEIDEA_CONFIG.baseUrl
    }
  });
} 