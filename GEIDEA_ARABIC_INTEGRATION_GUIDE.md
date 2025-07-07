# دليل تكامل بوابة الدفع Geidea 💳

## المتطلبات الأساسية 📋

1. حساب تاجر في Geidea
2. مفاتيح API من لوحة تحكم التاجر:
   - Merchant Public Key
   - API Password
   - Webhook Secret

## خطوات التكامل 🚀

### 1. إعداد متغيرات البيئة

أنشئ ملف `.env.local` وأضف المتغيرات التالية:

```env
GEIDEA_MERCHANT_PUBLIC_KEY=your_merchant_public_key
GEIDEA_API_PASSWORD=your_api_password
GEIDEA_WEBHOOK_SECRET=your_webhook_secret
GEIDEA_BASE_URL=https://api.merchant.geidea.net
NEXT_PUBLIC_BASE_URL=http://your-domain.com
```

### 2. إنشاء API Route لإنشاء جلسة الدفع

أنشئ ملف `app/api/geidea/create-session/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// دالة إنشاء التوقيع
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
    const body = await request.json();
    const { amount, currency = 'SAR', orderId, customerEmail, customerName } = body;

    // التحقق من البيانات المطلوبة
    if (!amount || !orderId || !customerEmail) {
      return NextResponse.json(
        { error: 'البيانات المطلوبة غير مكتملة' },
        { status: 400 }
      );
    }

    const merchantPublicKey = process.env.GEIDEA_MERCHANT_PUBLIC_KEY;
    const apiPassword = process.env.GEIDEA_API_PASSWORD;
    const geideaApiUrl = process.env.GEIDEA_BASE_URL;

    if (!merchantPublicKey || !apiPassword) {
      return NextResponse.json(
        { error: 'مفاتيح API غير متوفرة' },
        { status: 500 }
      );
    }

    const timestamp = new Date().toISOString();
    const signature = generateSignature(
      merchantPublicKey,
      parseFloat(amount),
      currency,
      orderId,
      apiPassword,
      timestamp
    );

    const sessionData = {
      amount: parseFloat(amount),
      currency: currency,
      merchantReferenceId: orderId,
      timestamp: timestamp,
      signature: signature,
      language: "ar",
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/geidea/callback`,
      customer: {
        email: customerEmail,
        name: customerName || 'Customer'
      }
    };

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

    if (!response.ok || responseData.responseCode !== '000') {
      return NextResponse.json(
        { error: 'فشل في إنشاء جلسة الدفع' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: responseData.session.id,
      orderId: orderId
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'خطأ في معالجة الطلب' },
      { status: 500 }
    );
  }
}
```

### 3. إنشاء API Route لمعالجة Webhook

أنشئ ملف `app/api/geidea/callback/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // التحقق من نجاح العملية
    const isSuccess = body.responseCode === '000' && body.status === 'SUCCESS';
    
    if (isSuccess) {
      // هنا يمكنك إضافة منطق تحديث قاعدة البيانات
      return NextResponse.json({
        success: true,
        message: 'تم معالجة الدفع بنجاح',
        orderId: body.orderId,
        transactionId: body.transactionId
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'فشلت عملية الدفع',
        orderId: body.orderId,
        error: body.responseMessage
      });
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'فشل في معالجة callback' },
      { status: 500 }
    );
  }
}
```

### 4. إنشاء مكون واجهة المستخدم للدفع

أنشئ ملف `components/GeideaPaymentModal.tsx`:

```typescript
'use client';

import React, { useState } from 'react';

interface GeideaPaymentModalProps {
  visible: boolean;
  onRequestClose: () => void;
  onPaymentSuccess: (data: any) => void;
  onPaymentFailure: (error: any) => void;
  amount: number;
  currency: string;
  customerEmail: string;
  merchantReferenceId?: string;
}

export default function GeideaPaymentModal({
  visible,
  onRequestClose,
  onPaymentSuccess,
  onPaymentFailure,
  amount,
  currency,
  customerEmail,
  merchantReferenceId
}: GeideaPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentSession = async () => {
    setLoading(true);
    setError(null);

    try {
      const orderId = merchantReferenceId || `ORDER_${Date.now()}`;
      const response = await fetch('/api/geidea/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          orderId,
          customerEmail
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في إنشاء جلسة الدفع');
      }

      onPaymentSuccess(data);
      onRequestClose();

    } catch (error) {
      setError(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
      onPaymentFailure(error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">الدفع الإلكتروني</h2>
        <p className="mb-4">المبلغ: {amount} {currency}</p>
        
        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}

        <button
          onClick={createPaymentSession}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'جاري المعالجة...' : 'إتمام الدفع'}
        </button>

        <button
          onClick={onRequestClose}
          className="mr-4 text-gray-600 hover:text-gray-800"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}
```

### 5. استخدام المكون في صفحتك

```typescript
import GeideaPaymentModal from '@/components/GeideaPaymentModal';

export default function PaymentPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handlePaymentSuccess = (data: any) => {
    console.log('تم الدفع بنجاح:', data);
    // هنا يمكنك إضافة منطق ما بعد نجاح الدفع
  };

  const handlePaymentFailure = (error: any) => {
    console.error('فشل الدفع:', error);
    // هنا يمكنك إضافة منطق معالجة الفشل
  };

  return (
    <div>
      <button onClick={() => setShowPaymentModal(true)}>
        الدفع الآن
      </button>

      <GeideaPaymentModal
        visible={showPaymentModal}
        onRequestClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
        amount={100}
        currency="SAR"
        customerEmail="customer@example.com"
      />
    </div>
  );
}
```

## اختبار التكامل 🧪

1. استخدم بطاقات الاختبار التالية:
   - رقم البطاقة: 4111 1111 1111 1111
   - تاريخ الانتهاء: أي تاريخ مستقبلي
   - CVV: أي 3 أرقام

2. تأكد من استلام callbacks في:
   - نجاح الدفع
   - فشل الدفع
   - إلغاء العملية

## ملاحظات هامة ⚠️

1. تأكد من أن `callbackUrl` يستخدم HTTPS في الإنتاج
2. احفظ المفاتيح السرية بشكل آمن
3. قم بتنفيذ منطق التحقق من التوقيع في webhook
4. اختبر السيناريوهات المختلفة قبل الإطلاق

## الدعم والمساعدة 🆘

- [وثائق Geidea الرسمية](https://developer.geidea.net/)
- [مركز المساعدة](https://help.geidea.net/) 
