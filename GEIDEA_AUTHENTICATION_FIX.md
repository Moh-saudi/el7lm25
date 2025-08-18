# 🔐 حل مشكلة مصادقة جيديا (Geidea Authentication Fix)

## 🚨 المشكلة الحالية
```
❌ Geidea API error: {
  responseMessage: 'General error', 
  detailedResponseMessage: 'Merchant authentication failed', 
  language: 'EN', 
  responseCode: '100', 
  detailedResponseCode: '023'
}
POST http://localhost:3003/api/geidea/create-session 401 (Unauthorized)
```

## 🔍 سبب المشكلة
المشكلة هي أن بيانات الاعتماد (Credentials) الحالية في ملف `.env.local` هي قيم تجريبية وهمية:

```env
GEIDEA_MERCHANT_PUBLIC_KEY=test_merchant_public_key_12345
GEIDEA_API_PASSWORD=test_api_password_12345
```

هذه القيم غير صحيحة ولا تمثل بيانات اعتماد حقيقية من جيديا، لذلك يرفض API جيديا الطلب ويعيد خطأ 401.

## ✅ الحلول المتاحة

### الحل الأول: الحصول على بيانات اعتماد حقيقية من جيديا

#### 1. إنشاء حساب في جيديا
1. اذهب إلى [لوحة تحكم جيديا](https://merchant.geidea.net/)
2. سجل حساب جديد أو استخدم حساب موجود
3. أكمل عملية التحقق من الحساب

#### 2. الحصول على بيانات الاعتماد
في لوحة تحكم جيديا، احصل على:
- **Merchant Public Key** (مفتاح التاجر العام)
- **API Password** (كلمة مرور API)
- **Webhook Secret** (سرية الويبهوك)

#### 3. تحديث ملف .env.local
استبدل القيم الوهمية بالبيانات الحقيقية:

```env
# Geidea Payment Gateway Configuration - REAL CREDENTIALS
GEIDEA_MERCHANT_PUBLIC_KEY=your_real_merchant_public_key_here
GEIDEA_API_PASSWORD=your_real_api_password_here
GEIDEA_WEBHOOK_SECRET=your_real_webhook_secret_here
GEIDEA_BASE_URL=https://api.merchant.geidea.net
NEXT_PUBLIC_GEIDEA_ENVIRONMENT=production
```

### الحل الثاني: استخدام وضع التطوير (Development Mode)

إذا لم تكن تريد إعداد حساب جيديا حقيقي الآن، يمكنك استخدام وضع التطوير:

#### 1. تفعيل وضع التطوير
```env
# Geidea Payment Gateway Configuration - DEVELOPMENT MODE
GEIDEA_MERCHANT_PUBLIC_KEY=test_merchant_public_key_12345
GEIDEA_API_PASSWORD=test_api_password_12345
GEIDEA_WEBHOOK_SECRET=test_webhook_secret_12345
GEIDEA_BASE_URL=https://api.merchant.geidea.net
NEXT_PUBLIC_GEIDEA_ENVIRONMENT=test
```

#### 2. التطبيق سيعمل في وضع المحاكاة
- لن يتم إرسال طلبات حقيقية إلى جيديا
- سيتم إنشاء جلسات وهمية للتطوير
- لن تظهر أخطاء 401

### الحل الثالث: تعطيل ميزة الدفع مؤقتاً

إذا كنت تريد التركيز على ميزات أخرى:

#### 1. إضافة متغير بيئة لتعطيل الدفع
```env
DISABLE_PAYMENT_FEATURES=true
```

#### 2. تعديل الكود للتحقق من هذا المتغير
```typescript
if (process.env.DISABLE_PAYMENT_FEATURES === 'true') {
  // إظهار رسالة أن ميزة الدفع معطلة
  return NextResponse.json({
    success: false,
    message: 'Payment features are temporarily disabled'
  });
}
```

## 🧪 اختبار الحل

### بعد تطبيق الحل الأول (بيانات اعتماد حقيقية):
1. أعد تشغيل الخادم:
   ```bash
   npm run dev
   ```

2. جرب إنشاء جلسة دفع
3. تحقق من عدم ظهور خطأ 401

### بعد تطبيق الحل الثاني (وضع التطوير):
1. ستظهر رسائل في Console تشير إلى وضع التطوير
2. لن تظهر أخطاء 401
3. ستظهر جلسات وهمية

## 📋 خطوات فورية للتطبيق

### الخطوة 1: تحديد الحل المفضل
- **للإنتاج**: استخدم الحل الأول (بيانات اعتماد حقيقية)
- **للتطوير**: استخدم الحل الثاني (وضع التطوير)
- **للتطوير المؤقت**: استخدم الحل الثالث (تعطيل الميزة)

### الخطوة 2: تطبيق الحل
1. اختر الحل المناسب من أعلاه
2. عدّل ملف `.env.local` حسب الحل المختار
3. أعد تشغيل الخادم

### الخطوة 3: التحقق من النتيجة
1. افتح وحدة تحكم المتصفح (F12)
2. جرب إنشاء جلسة دفع
3. تحقق من عدم ظهور خطأ 401

## 🔧 إعدادات إضافية

### للتطوير المحلي
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### للإنتاج
```env
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### إعداد Webhook (اختياري)
```env
GEIDEA_WEBHOOK_URL=https://your-domain.com/api/geidea/webhook
```

## 📞 الدعم

إذا واجهت مشاكل:
1. تحقق من صحة البيانات في ملف `.env.local`
2. تأكد من إعادة تشغيل الخادم بعد التعديل
3. راجع سجلات الأخطاء في وحدة تحكم المتصفح
4. اتصل بدعم جيديا إذا كنت تستخدم بيانات اعتماد حقيقية

## 🎯 النتيجة المتوقعة

بعد تطبيق الحل المناسب:
- ✅ لن تظهر أخطاء 401
- ✅ ستعمل ميزة الدفع بشكل صحيح
- ✅ لن تظهر رسائل تحذير في Console
- ✅ ستعمل جميع ميزات التطبيق الأخرى بشكل طبيعي 