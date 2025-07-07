# تكامل Geidea Payment Gateway 🏦

## نظرة عامة

تم تحديث نظام الدفع ليتوافق مع Geidea Payment Gateway الرسمي. النظام يدعم الآن:

- ✅ إنشاء جلسات دفع آمنة
- ✅ معالجة webhooks للدفع
- ✅ وضع الاختبار للتطوير
- ✅ معالجة الأخطاء الشاملة
- ✅ تحديث حالة المستخدم تلقائياً

## التكوين المطلوب

### 1. متغيرات البيئة

أضف هذه المتغيرات إلى ملف `.env.local`:

```env
# Geidea Payment Gateway Configuration
GEIDEA_MERCHANT_PUBLIC_KEY=your_merchant_public_key
GEIDEA_API_PASSWORD=your_api_password
GEIDEA_WEBHOOK_SECRET=your_webhook_secret
GEIDEA_BASE_URL=https://api.merchant.geidea.net

# Application Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. الحصول على بيانات الاعتماد

1. سجل في [Geidea Merchant Portal](https://merchant.geidea.net)
2. احصل على:
   - Merchant Public Key
   - API Password
   - Webhook Secret

## كيفية العمل

### 1. إنشاء جلسة الدفع

```typescript
// POST /api/geidea/create-session
{
  "amount": "100.00",
  "currency": "SAR",
  "merchantReferenceId": "HAGZZ_user123_1234567890",
  "callbackUrl": "https://yourdomain.com/api/geidea/webhook",
  "returnUrl": "https://yourdomain.com/dashboard/payment/success",
  "customerEmail": "user@example.com",
  "billingAddress": {
    "city": "Riyadh",
    "countryCode": "SAU",
    "street": "Street 1",
    "postCode": "1000"
  }
}
```

### 2. معالجة Webhook

```typescript
// POST /api/geidea/webhook
{
  "eventType": "PAYMENT_SUCCESS",
  "orderId": "12345",
  "merchantReferenceId": "HAGZZ_user123_1234567890",
  "status": "SUCCESS",
  "amount": "100.00",
  "currency": "SAR"
}
```

## الملفات المحدثة

### 1. API Endpoints

- `src/app/api/geidea/create-session/route.ts` - إنشاء جلسة الدفع
- `src/app/api/geidea/webhook/route.ts` - معالجة webhooks
- `src/app/api/geidea/test/route.ts` - وضع الاختبار

### 2. صفحات الواجهة

- `src/app/dashboard/payment/page.tsx` - صفحة الدفع الرئيسية
- `src/app/dashboard/payment/success/page.tsx` - صفحة نجاح الدفع

### 3. التكوين

- `src/lib/firebase/config.ts` - تكوين Geidea
- `.env.local` - متغيرات البيئة

## وضع الاختبار

في بيئة التطوير، النظام يستخدم endpoint الاختبار:

```typescript
const apiEndpoint = process.env.NODE_ENV === 'development' 
  ? '/api/geidea/test' 
  : '/api/geidea/create-session';
```

### اختبار الدفع

1. اختر باقة
2. اضغط "دفع عبر Geidea"
3. ستظهر رسالة نجاح في وضع الاختبار
4. في الإنتاج سيتم توجيهك لصفحة الدفع

## معالجة الأخطاء

### أخطاء شائعة وحلولها

1. **400 Bad Request**
   - تحقق من صحة البيانات المرسلة
   - تأكد من وجود جميع الحقول المطلوبة

2. **401 Unauthorized**
   - تحقق من صحة بيانات الاعتماد
   - تأكد من تكوين متغيرات البيئة

3. **Webhook Signature Error**
   - تحقق من صحة webhook secret
   - تأكد من تكوين التوقيع

## الأمان

### 1. التحقق من التوقيع

```typescript
function verifySignature(payload: string, signature: string): boolean {
  // في الإنتاج، استخدم HMAC للتحقق من التوقيع
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}
```

### 2. حماية البيانات

- جميع البيانات الحساسة محفوظة في متغيرات البيئة
- استخدام HTTPS في الإنتاج
- التحقق من صحة جميع المدخلات

## المراقبة والتشخيص

### 1. سجلات النظام

```typescript
console.log('Payment initiated:', {
  amount,
  currency,
  merchantReferenceId,
  package: selectedPackage
});
```

### 2. تشخيص الأخطاء

```typescript
// في Developer Tools Console
window.debugSystem?.checkGeideaConfig();
window.debugSystem?.testPaymentAPI();
```

## الانتقال للإنتاج

### 1. تحديث متغيرات البيئة

```env
NODE_ENV=production
GEIDEA_BASE_URL=https://api.merchant.geidea.net
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 2. تكوين Webhook URL

في Geidea Merchant Portal:
```
Webhook URL: https://yourdomain.com/api/geidea/webhook
```

### 3. اختبار النظام

1. اختبر الدفع بمبالغ صغيرة
2. تحقق من استلام webhooks
3. تأكد من تحديث حالة المستخدم

## الدعم والمساعدة

### روابط مفيدة

- [Geidea API Documentation](https://docs.geidea.net)
- [Geidea Merchant Portal](https://merchant.geidea.net)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

### التشخيص

إذا واجهت مشاكل:

1. تحقق من سجلات الخادم
2. استخدم أدوات التشخيص في المتصفح
3. راجع ملف `TROUBLESHOOTING.md`
4. تحقق من تكوين متغيرات البيئة

---

**ملاحظة**: تأكد من اختبار النظام بشكل شامل قبل استخدامه في الإنتاج. 
