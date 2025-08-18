#!/usr/bin/env node

/**
 * سكريبت اختبار تكوين جيديا الجديد
 * يختبر إنشاء جلسة دفع باستخدام المفاتيح الجديدة
 */

const https = require('https');
const crypto = require('crypto');

console.log('🧪 اختبار تكوين جيديا الجديد');
console.log('============================\n');

// المفاتيح الجديدة
const merchantPublicKey = '3448c010-87b1-41e7-9771-cac444268cfb';
const apiPassword = 'edfd5eee-fd1b-4932-9ee1-d6d9ba7599f0';
const baseUrl = 'https://api.merchant.geidea.net';

console.log('🔑 المفاتيح المستخدمة:');
console.log(`Merchant Key: ${merchantPublicKey.substring(0, 8)}...`);
console.log(`API Password: ${apiPassword.substring(0, 8)}...`);
console.log(`Base URL: ${baseUrl}`);
console.log('');

// إنشاء توقيع للاختبار
function generateSignature(merchantPublicKey, amount, currency, merchantReferenceId, apiPassword, timestamp) {
  const amountStr = amount.toFixed(2);
  const data = `${merchantPublicKey}${amountStr}${currency}${merchantReferenceId}${timestamp}`;
  return crypto
    .createHmac('sha256', apiPassword)
    .update(data)
    .digest('base64');
}

// بيانات الاختبار
const testData = {
  amount: 10.00,
  currency: 'EGP',
  merchantReferenceId: `TEST${Date.now()}`,
  timestamp: new Date().toISOString(),
  callbackUrl: 'https://webhook.site/test-geidea-callback-2025',
  returnUrl: 'https://www.el7lm.com/payment/success',
  language: 'ar',
  paymentOperation: 'Pay'
};

// إنشاء التوقيع
const signature = generateSignature(
  merchantPublicKey,
  testData.amount,
  testData.currency,
  testData.merchantReferenceId,
  apiPassword,
  testData.timestamp
);

console.log('📝 بيانات الاختبار:');
console.log(`المبلغ: ${testData.amount} ${testData.currency}`);
console.log(`المرجع: ${testData.merchantReferenceId}`);
console.log(`التوقيت: ${testData.timestamp}`);
console.log(`التوقيع: ${signature.substring(0, 8)}...`);
console.log('');

// إرسال طلب الاختبار
const postData = JSON.stringify({
  amount: testData.amount,
  currency: testData.currency,
  timestamp: testData.timestamp,
  merchantReferenceId: testData.merchantReferenceId,
  signature: signature,
  callbackUrl: testData.callbackUrl,
  returnUrl: testData.returnUrl,
  language: testData.language,
  paymentOperation: testData.paymentOperation
});

const options = {
  hostname: 'api.merchant.geidea.net',
  port: 443,
  path: '/payment-intent/api/v2/direct/session',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Basic ${Buffer.from(`${merchantPublicKey}:${apiPassword}`).toString('base64')}`,
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('�� إرسال طلب الاختبار...');

const req = https.request(options, (res) => {
  console.log(`📨 استجابة الخادم: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('\n📄 استجابة جيديا:');
      console.log(JSON.stringify(response, null, 2));
      
      if (response.responseCode === '000') {
        console.log('\n✅ نجح الاختبار! تم إنشاء جلسة الدفع بنجاح');
        console.log(`Session ID: ${response.session?.id}`);
        console.log(`Redirect URL: ${response.session?.redirectUrl}`);
      } else {
        console.log('\n❌ فشل الاختبار');
        console.log(`Error: ${response.detailedResponseMessage || response.responseMessage}`);
      }
    } catch (error) {
      console.log('\n❌ خطأ في تحليل الاستجابة:', error.message);
      console.log('البيانات الخام:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ خطأ في الاتصال:', error.message);
});

req.write(postData);
req.end();

console.log('⏳ في انتظار الاستجابة...'); 