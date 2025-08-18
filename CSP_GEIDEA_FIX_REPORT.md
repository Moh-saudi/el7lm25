# تقرير إصلاح مشكلة CSP لجيديا (Geidea)

## المشكلة الأصلية
```
Refused to load the script 'https://www.merchant.geidea.net/hpp/geideaCheckout.min.js' because it violates the following Content Security Policy directive: "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://securetoken.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com"
```

## تحليل المشكلة

### السبب الجذري
1. **تضارب في إعدادات CSP**: كان هناك تضارب بين إعدادات CSP في `next.config.js` و `middleware.js`
2. **عدم تطبيق CSP الصحيح**: إعدادات CSP العامة في `next.config.js` كانت تطبق على جميع الصفحات وتتجاوز الإعدادات المخصصة في middleware
3. **عدم تغطية صفحات الدفع**: صفحات `bulk-payment` لم تكن مشمولة في شروط middleware

## الحلول المطبقة

### 1. تحديث middleware.js
**الملف**: `src/middleware.js`

**التغيير**: تحسين شروط تطبيق CSP لجيديا
```javascript
// قبل التحديث
if (request.nextUrl.pathname.includes('geidea') || request.nextUrl.pathname.includes('payment')) {

// بعد التحديث  
if (request.nextUrl.pathname.includes('geidea') || 
    request.nextUrl.pathname.includes('bulk-payment') || 
    request.nextUrl.pathname.includes('payment')) {
```

### 2. تحديث next.config.js
**الملف**: `next.config.js`

**التغيير**: إضافة نطاقات جيديا إلى CSP العامة
```javascript
// قبل التحديث
"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://securetoken.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com"

// بعد التحديث
"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.merchant.geidea.net https://accosa-ivs.s3.ap-south-1.amazonaws.com https://secure-acs2ui-b1.wibmo.com https://www.gstatic.com https://securetoken.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com"
```

**النطاقات المضافة**:
- `https://www.merchant.geidea.net` - المكتبة الرئيسية لجيديا
- `https://accosa-ivs.s3.ap-south-1.amazonaws.com` - خدمات الدفع الإضافية
- `https://secure-acs2ui-b1.wibmo.com` - واجهة المستخدم الآمنة

### 3. تحسين GeideaPaymentModal.tsx
**الملف**: `src/components/GeideaPaymentModal.tsx`

**التحسينات**:
- إضافة رسائل تصحيح محسنة
- تحسين معالجة الأخطاء
- إضافة تفاصيل أكثر عن أخطاء CSP

```javascript
// إضافة رسائل تصحيح
console.log('🔍 Current CSP check - attempting to load:', 'https://www.merchant.geidea.net/hpp/geideaCheckout.min.js');

// تحسين رسائل الخطأ
console.error('🔍 CSP Error Details:', {
  error: error,
  scriptSrc: script.src,
  currentUrl: window.location.href,
  userAgent: navigator.userAgent
});
```

### 4. إنشاء صفحة اختبار CSP
**الملف**: `src/app/test-csp/page.tsx`

**الغرض**: اختبار إعدادات CSP للتأكد من عملها بشكل صحيح

## النطاقات المضافة إلى CSP

### script-src
```
https://www.merchant.geidea.net
https://accosa-ivs.s3.ap-south-1.amazonaws.com  
https://secure-acs2ui-b1.wibmo.com
```

### connect-src
```
https://api.merchant.geidea.net
https://www.merchant.geidea.net
https://secure-acs2ui-b1.wibmo.com
```

### frame-src
```
https://www.merchant.geidea.net
https://secure-acs2ui-b1.wibmo.com
```

## الصفحات المتأثرة

### الصفحات التي تحتاج إلى CSP محسن:
- `/dashboard/player/bulk-payment`
- `/dashboard/agent/bulk-payment`
- `/dashboard/club/bulk-payment`
- `/dashboard/academy/bulk-payment`
- `/dashboard/trainer/bulk-payment`
- أي صفحة تحتوي على `geidea` أو `payment` في المسار

## كيفية الاختبار

### 1. اختبار مباشر
```bash
# تشغيل الخادم
npm run dev

# زيارة صفحة الدفع
http://localhost:3000/dashboard/player/bulk-payment
```

### 2. اختبار CSP
```bash
# زيارة صفحة اختبار CSP
http://localhost:3000/test-csp
```

### 3. فحص وحدة التحكم
- افتح أدوات المطور (F12)
- انتقل إلى تبويب Console
- تحقق من عدم وجود أخطاء CSP

## النتائج المتوقعة

### ✅ النجاح
- تحميل مكتبة جيديا بدون أخطاء CSP
- عدم ظهور رسائل خطأ في وحدة التحكم
- عمل مكون الدفع بشكل طبيعي

### ❌ الفشل
- استمرار ظهور أخطاء CSP
- عدم تحميل مكتبة جيديا
- رسائل خطأ في وحدة التحكم

## خطوات إضافية للتحقق

### 1. فحص إعدادات الخادم
```bash
# التحقق من تطبيق middleware
curl -I http://localhost:3000/dashboard/player/bulk-payment
```

### 2. فحص headers
```bash
# التحقق من CSP headers
curl -H "Accept: text/html" http://localhost:3000/dashboard/player/bulk-payment
```

### 3. اختبار في المتصفح
- فتح أدوات المطور
- الانتقال إلى تبويب Network
- البحث عن طلبات إلى `merchant.geidea.net`

## ملاحظات مهمة

1. **إعادة تشغيل الخادم**: قد تحتاج لإعادة تشغيل الخادم بعد تغيير `next.config.js`
2. **مسح التخزين المؤقت**: مسح cache المتصفح قد يكون ضرورياً
3. **اختبار في بيئات مختلفة**: اختبار في Chrome و Firefox و Safari

## المراجع

- [Geidea Documentation](https://docs.geidea.net/)
- [Content Security Policy MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Next.js Headers Configuration](https://nextjs.org/docs/app/api-reference/next-config-js/headers)

## تاريخ التحديث
- **التاريخ**: 3 أغسطس 2025
- **الإصدار**: 1.0
- **الحالة**: مكتمل ✅ 