# دليل حل المشاكل 🔧

## المشاكل الحالية وحلولها

### 1. مشاكل Firebase Configuration

**المشكلة:**
```
API key not valid. Please pass a valid API key.
FirebaseError: Installations: Create Installation request failed
```

**الأسباب المحتملة:**
- متغيرات Firebase البيئة غير صحيحة
- قيم placeholder بدلاً من القيم الحقيقية
- مشاكل في تكوين Firebase

**الحلول:**

#### أ) إصلاح متغيرات البيئة
تأكد من أن ملف `.env.local` يحتوي على القيم الصحيحة:

```bash
# Firebase Configuration (Development)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDCQQxUbeQQrlty5HnF65-7TK0TB2zB7R4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=el7hm-87884.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=el7hm-87884
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=el7hm-87884.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=865241332465
NEXT_PUBLIC_FIREBASE_APP_ID=1:865241332465:web:158ed5fb2f0a80eecf0750
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-RQ3ENTG6KJ
```

#### ب) إعادة تشغيل الخادم
```bash
# أوقف الخادم (Ctrl+C)
npm run dev
```

#### ج) فحص التشخيص
افتح Developer Tools > Console وابحث عن:
```
=== Firebase Debug Info ===
```

### 2. خطأ 400 Bad Request في Geidea API

**المشكلة:**
```
Failed to load resource: the server responded with a status of 400 (Bad Request)
```

**الأسباب المحتملة:**
- متغيرات البيئة غير محددة
- بيانات الطلب غير صحيحة
- مشاكل في التوقيع

**الحلول:**

#### أ) إعداد متغيرات البيئة
```bash
# أنشئ ملف .env.local في المجلد الجذر
cp .env.local.example .env.local

# أضف بيانات Geidea الحقيقية
GEIDEA_MERCHANT_PUBLIC_KEY=your_real_merchant_key
GEIDEA_API_PASSWORD=your_real_api_password
GEIDEA_WEBHOOK_SECRET=your_webhook_secret
```

#### ب) استخدام وضع الاختبار (Development)
في وضع التطوير، النظام يستخدم endpoint اختبار:
```typescript
const apiEndpoint = process.env.NODE_ENV === 'development' 
  ? '/api/geidea/test' 
  : '/api/geidea/create-session';
```

#### ج) التحقق من البيانات المرسلة
افتح Developer Tools > Console لرؤية البيانات المرسلة:
```javascript
console.log('Received request body:', body);
console.log('Payment API response:', data);
```

### 3. خطأ SVG Path

**المشكلة:**
```
Error: <path> attribute d: Expected moveto path command ('M' or 'm'), "Z".
```

**الحل:**
هذا خطأ في أيقونات SVG. يمكن تجاهله أو إصلاحه:

```typescript
// في الملف الذي يحتوي على الأيقونات
const IconComponent = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);
```

### 4. خطأ صورة QR Demo

**المشكلة:**
```
Failed to load resource: the server responded with a status of 404 (Not Found)
:3000/qr-demo.png
```

**الحل:**
أضف الصورة أو استبدلها:

```bash
# أضف الصورة في مجلد public
public/qr-demo.png
```

أو استبدل الرابط:
```typescript
// بدلاً من
<img src="/qr-demo.png" />

// استخدم
<img src="/placeholder-qr.png" />
// أو
<div className="qr-placeholder">QR Code</div>
```

## خطوات التشخيص

### 1. فحص متغيرات البيئة
```bash
# تأكد من وجود الملف
ls -la .env.local

# تحقق من المحتوى
cat .env.local
```

### 2. فحص سجلات الخادم
```bash
# في terminal التطبيق
npm run dev

# راقب السجلات للبحث عن أخطاء
```

### 3. فحص Console المتصفح
```javascript
// افتح Developer Tools > Console
// ابحث عن:
// - أخطاء JavaScript
// - طلبات API فاشلة
// - رسائل التطبيق
// - Firebase Debug Info
```

### 4. اختبار API مباشرة
```bash
# اختبر endpoint الاختبار
curl -X POST http://localhost:3000/api/geidea/test \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "100.00",
    "currency": "SAR",
    "merchantReferenceId": "test-123",
    "callbackUrl": "http://localhost:3000/api/geidea/webhook"
  }'
```

## حلول سريعة

### 1. إعادة تشغيل الخادم
```bash
# أوقف الخادم (Ctrl+C)
# ثم أعد تشغيله
npm run dev
```

### 2. مسح Cache المتصفح
```bash
# في المتصفح
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### 3. فحص التبعيات
```bash
# أعد تثبيت التبعيات
npm install

# أو
yarn install
```

### 4. فحص إعدادات Next.js
```javascript
// في next.config.js
module.exports = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['your-domain.com'],
  },
}
```

## اختبار النظام

### 1. اختبار الدفع في وضع التطوير
1. تأكد من أن `NODE_ENV=development`
2. اذهب لصفحة الدفع
3. اختر Geidea
4. يجب أن ترى رسالة نجاح فورية

### 2. اختبار الدفع في الإنتاج
1. أضف بيانات Geidea الحقيقية
2. تأكد من أن `NODE_ENV=production`
3. اختبر التدفق الكامل

### 3. اختبار Webhook
```bash
# اختبر webhook محلياً
curl -X POST http://localhost:3000/api/geidea/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "test-order",
    "merchantReferenceId": "test-123",
    "responseCode": "000",
    "detailedResponseCode": "000"
  }'
```

## الدعم الفني

إذا استمرت المشاكل:

1. **راجع السجلات** في Console و Terminal
2. **تحقق من متغيرات البيئة**
3. **اختبر API endpoints** مباشرة
4. **راجع وثائق Geidea** للتأكد من صحة البيانات
5. **تواصل مع فريق الدعم** مع تفاصيل الخطأ

## روابط مفيدة

- [Geidea Documentation](https://docs.geidea.net)
- [Next.js Troubleshooting](https://nextjs.org/docs/advanced-features/debugging)
- [Firebase Console](https://console.firebase.google.com) 
