# 🧪 إعداد Geidea في وضع الاختبار

## 🎯 الوضع الحالي
- ✅ Firebase: تم الإعداد بنجاح
- ✅ Environment: تم تعيينه على `test`
- ❌ Geidea: يحتاج بيانات الاختبار

## 📋 إعدادات الاختبار الحالية

```env
# Geidea Test Configuration
GEIDEA_MERCHANT_PUBLIC_KEY=your_merchant_public_key_here
GEIDEA_API_PASSWORD=your_api_password_here
GEIDEA_WEBHOOK_SECRET=your_webhook_secret_here
GEIDEA_BASE_URL=https://api-test.merchant.geidea.net
NEXT_PUBLIC_GEIDEA_ENVIRONMENT=test
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 🔧 خطوات إعداد وضع الاختبار

### الخطوة 1: الحصول على بيانات الاختبار
1. **اذهب إلى**: https://merchant.geidea.net/
2. **سجل دخول إلى حسابك**
3. **اذهب إلى إعدادات الاختبار (Test Settings)**
4. **احصل على بيانات الاختبار:**
   - Test Merchant Public Key
   - Test API Password
   - Test Webhook Secret

### الخطوة 2: تحديث ملف .env.local

استبدل القيم الوهمية ببيانات الاختبار:

```env
# Geidea Test Configuration
GEIDEA_MERCHANT_PUBLIC_KEY=your_test_merchant_public_key
GEIDEA_API_PASSWORD=your_test_api_password
GEIDEA_WEBHOOK_SECRET=your_test_webhook_secret
GEIDEA_BASE_URL=https://api-test.merchant.geidea.net
NEXT_PUBLIC_GEIDEA_ENVIRONMENT=test
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### الخطوة 3: إعداد Webhook للاختبار
في لوحة تحكم Geidea، أضف Webhook URL للاختبار:
```
http://localhost:3000/api/geidea/webhook
```

### الخطوة 4: التحقق من الإعداد
```bash
node scripts/verify-geidea-config.js
```

## 🧪 مزايا وضع الاختبار

### ✅ المزايا:
- **لا توجد رسوم حقيقية**
- **يمكن اختبار جميع الميزات**
- **بيئة آمنة للتطوير**
- **بيانات اختبار مجانية**

### 🔍 ما يمكن اختباره:
- إنشاء جلسات الدفع
- معالجة المدفوعات
- استقبال Webhooks
- إدارة الأخطاء
- واجهة المستخدم

## 🚨 ملاحظات مهمة للاختبار

### 1. بيانات الاختبار
- **استخدم بيانات الاختبار فقط**
- **لا تستخدم بيانات الإنتاج**
- **احتفظ ببيانات الاختبار آمنة**

### 2. Webhook URLs
- **الاختبار**: `http://localhost:3000/api/geidea/webhook`
- **الإنتاج**: `https://your-domain.com/api/geidea/webhook`

### 3. المدفوعات
- **في الاختبار**: لا توجد رسوم حقيقية
- **في الإنتاج**: مدفوعات حقيقية

## 🔍 التحقق من الإعداد

### اختبار التكوين
```bash
node scripts/verify-geidea-config.js
```

### اختبار إنشاء جلسة دفع
```bash
curl -X POST http://localhost:3000/api/geidea/create-session \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "currency": "EGP"}'
```

## 📞 الحصول على بيانات الاختبار

### إذا لم يكن لديك حساب:
1. اذهب إلى: https://merchant.geidea.net/
2. انقر على "Sign Up"
3. املأ البيانات المطلوبة
4. احصل على بيانات الاختبار

### إذا كان لديك حساب:
1. سجل دخول إلى لوحة التحكم
2. اذهب إلى "Test Settings" أو "Sandbox"
3. انسخ بيانات الاختبار

## 🎯 النتيجة المتوقعة

بعد الإعداد الصحيح:
- ✅ ستعمل المدفوعات في وضع الاختبار
- ✅ ستستقبل إشعارات الدفع عبر Webhook
- ✅ ستتمكن من اختبار جميع الميزات بدون رسوم

---

**هل تحتاج مساعدة في الحصول على بيانات الاختبار أو تحديث ملف .env.local؟** 