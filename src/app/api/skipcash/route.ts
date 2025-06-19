import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import * as cryptojs from 'crypto-js';

const paymentGatewayDetails = {
  sandboxURL: process.env.SKIPCASH_SANDBOX_URL || 'https://skipcashtest.azurewebsites.net',
  productionURL: process.env.SKIPCASH_PRODUCTION_URL || 'https://api.skipcash.app',
  secretKey: process.env.SKIPCASH_SECRET_KEY || '',
  keyId: process.env.SKIPCASH_KEY_ID || '',
  clientId: process.env.SKIPCASH_CLIENT_ID || '',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      firstName,
      lastName,
      phone,
      email,
      transactionId,
      subject,
      description,
      custom1, custom2, custom3, custom4, custom5, custom6, custom7, custom8, custom9, custom10,
      // يمكن إضافة المزيد من الحقول إذا لزم الأمر
    } = body;

    const paymentDetails = {
      Uid: uuidv4(),
      KeyId: paymentGatewayDetails.keyId,
      Amount: amount,
      FirstName: firstName,
      LastName: lastName,
      Phone: phone,
      Email: email,
      TransactionId: transactionId,
      Subject: subject || 'دفع اشتراك',
      Description: description || 'دفع اشتراك في المنصة',
      Custom1: custom1 || '',
      Custom2: custom2 || '',
      Custom3: custom3 || '',
      Custom4: custom4 || '',
      Custom5: custom5 || '',
      Custom6: custom6 || '',
      Custom7: custom7 || '',
      Custom8: custom8 || '',
      Custom9: custom9 || '',
      Custom10: custom10 || '',
      ReturnUrl: process.env.SKIPCASH_RETURN_URL || 'https://yourdomain.com/payment/success',
      WebhookUrl: process.env.SKIPCASH_WEBHOOK_URL || 'https://yourdomain.com/api/skipcash/webhook',
      OnlyDebitCard: true,
    };

    // ترتيب الحقول كما هو مطلوب لتوليد التوقيع
    const combinedData = `Uid=${paymentDetails.Uid},KeyId=${paymentDetails.KeyId},Amount=${paymentDetails.Amount},FirstName=${paymentDetails.FirstName},LastName=${paymentDetails.LastName},Phone=${paymentDetails.Phone},Email=${paymentDetails.Email},TransactionId=${paymentDetails.TransactionId},Subject=${paymentDetails.Subject},Description=${paymentDetails.Description},Custom1=${paymentDetails.Custom1},Custom2=${paymentDetails.Custom2},Custom3=${paymentDetails.Custom3},Custom4=${paymentDetails.Custom4},Custom5=${paymentDetails.Custom5},Custom6=${paymentDetails.Custom6},Custom7=${paymentDetails.Custom7},Custom8=${paymentDetails.Custom8},Custom9=${paymentDetails.Custom9},Custom10=${paymentDetails.Custom10},ReturnUrl=${paymentDetails.ReturnUrl},WebhookUrl=${paymentDetails.WebhookUrl},OnlyDebitCard=${paymentDetails.OnlyDebitCard}`;

    const combinedDataHash = cryptojs.HmacSHA256(
      combinedData,
      paymentGatewayDetails.secretKey
    );
    const hashInBase64 = cryptojs.enc.Base64.stringify(combinedDataHash);

    const response = await fetch(`${paymentGatewayDetails.sandboxURL}/api/v1/payments`, {
      method: 'POST',
      headers: {
        Authorization: hashInBase64,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentDetails),
    });
    const json = await response.json();
    // أعد فقط رابط الدفع النهائي payUrl إن وجد
    return NextResponse.json({
      ...json,
      payUrl: json?.resultObj?.payUrl || null
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 