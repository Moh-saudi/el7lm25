import { NextRequest, NextResponse } from 'next/server';
import cryptojs from 'crypto-js';
import { db } from '@/lib/firebase/config'; // عدّل المسار إذا لزم
import { doc, setDoc, getDoc } from 'firebase/firestore';

const SKIPCASH_WEBHOOK_KEY = process.env.SKIPCASH_WEBHOOK_KEY || '';

function buildSignature(body: any) {
  let fields = [
    `PaymentId=${body.PaymentId}`,
    `Amount=${body.Amount}`,
    `StatusId=${body.StatusId}`,
  ];
  if (body.TransactionId) fields.push(`TransactionId=${body.TransactionId}`);
  if (body.Custom1) fields.push(`Custom1=${body.Custom1}`);
  fields.push(`VisaId=${body.VisaId}`);
  return fields.join(',');
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const body = await req.json();

    // بناء التوقيع
    const signatureString = buildSignature(body);
    const hash = cryptojs.HmacSHA256(signatureString, SKIPCASH_WEBHOOK_KEY);
    const expectedAuth = cryptojs.enc.Base64.stringify(hash);

    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // تحديث حالة الدفع في قاعدة البيانات حسب StatusId
    if (body.TransactionId) {
      const paymentRef = doc(db, 'payments', body.TransactionId);
      const paymentDoc = await getDoc(paymentRef);
      let currentStatus = paymentDoc.exists() ? paymentDoc.data()?.status : null;

      // لا تحدث إلى فشل إذا كانت الحالة مدفوعة بالفعل
      if (currentStatus === 'paid' && [4, 5, 6, 7, 8].includes(body.StatusId)) {
        return NextResponse.json({ message: 'Already paid, ignore fail/cancel.' }, { status: 200 });
      }

      let newStatus = '';
      switch (body.StatusId) {
        case 2: newStatus = 'paid'; break;
        case 3: newStatus = 'cancelled'; break;
        case 4: newStatus = 'failed'; break;
        case 5: newStatus = 'rejected'; break;
        case 6: newStatus = 'refunded'; break;
        case 7: newStatus = 'pending_refund'; break;
        case 8: newStatus = 'refund_failed'; break;
        default: newStatus = 'pending'; break;
      }

      await setDoc(paymentRef, { status: newStatus, skipcash: body }, { merge: true });
    }

    // يمكنك هنا أيضًا حفظ TokenId أو RecurringSubscriptionId إذا وجدت
    // مثال: إذا body.TokenId !== 'NA' && body.TokenId !== null

    return NextResponse.json({ message: 'Webhook processed', body }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
} 