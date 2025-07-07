# دليل التكامل النهائي مع Geidea 🚀

## 📋 ملخص التحديثات

تم تحديث النظام بالكامل ليتوافق مع [وثائق Geidea الرسمية](https://docs.geidea.net/docs/react-native) ويوفر تجربة دفع سلسة وآمنة.

## ✅ المميزات المنجزة

### 1. **تكامل API محسن** 🔧
- ✅ **API Endpoint محدث**: `/api/geidea/create-session`
- ✅ **Webhook Handler**: `/api/geidea/webhook`
- ✅ **التوقيع الآمن**: HMAC للتحقق من صحة الطلبات
- ✅ **معالجة الأخطاء**: رسائل خطأ واضحة ومفصلة

### 2. **واجهة مستخدم محسنة** 🎨
- ✅ **مودال الدفع**: `GeideaPaymentModal` مع iframe آمن
- ✅ **صفحة النجاح**: تصميم جميل مع تفاصيل العملية
- ✅ **صفحة الفشل**: رسائل واضحة وحلول مقترحة
- ✅ **تجربة سلسة**: لا حاجة لترك الصفحة

### 3. **الأمان المحسن** 🔒
- ✅ **iframe آمن**: عزل صفحة الدفع
- ✅ **معالجة الرسائل**: تحقق من origin الرسائل
- ✅ **التوقيع الآمن**: HMAC للتحقق من webhooks
- ✅ **معالجة الأخطاء**: رسائل خطأ آمنة

## 🏗️ البنية الجديدة

### 1. **API Endpoints**

```typescript
// إنشاء جلسة الدفع
POST /api/geidea/create-session
{
  "amount": "100.00",
  "currency": "SAR",
  "merchantReferenceId": "HAGZZ_user123_1234567890",
  "callbackUrl": "https://yourdomain.com/api/geidea/webhook",
  "returnUrl": "https://yourdomain.com/dashboard/payment/success",
  "customerEmail": "user@example.com",
  "language": "ar",
  "cardOnFile": true,
  "tokenization": true
}

// استقبال webhooks
POST /api/geidea/webhook
Headers: {
  "x-geidea-signature": "hmac_signature"
}
```

### 2. **المكونات الجديدة**

```typescript
// مودال الدفع
<GeideaPaymentModal
  visible={showModal}
  onRequestClose={() => setShowModal(false)}
  onPaymentSuccess={handleSuccess}
  onPaymentFailure={handleFailure}
  amount={100}
  currency="SAR"
  title="الدفع الإلكتروني"
  description="أكمل عملية الدفع"
  customerEmail="user@example.com"
  merchantReferenceId="HAGZZ_123"
/>

// صفحات النتيجة
/dashboard/payment/success  // صفحة النجاح
/dashboard/payment/failure  // صفحة الفشل
```

### 3. **معالجة الرسائل**

```typescript
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.origin !== 'https://api.merchant.geidea.net') return;
    
    const { type, data } = event.data;
    switch (type) {
      case 'PAYMENT_SUCCESS':
        handlePaymentSuccess(data);
        break;
      case 'PAYMENT_FAILURE':
        handlePaymentFailure(data);
        break;
      case 'PAYMENT_CANCELLED':
        handlePaymentFailure({ error: 'تم إلغاء عملية الدفع' });
        break;
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

## 🚀 كيفية الاستخدام

### 1. **إعداد البيئة**

```env
# Geidea Configuration
GEIDEA_MERCHANT_PUBLIC_KEY=your_merchant_public_key
GEIDEA_API_PASSWORD=your_api_password
GEIDEA_WEBHOOK_SECRET=your_webhook_secret
GEIDEA_BASE_URL=https://api.merchant.geidea.net

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. **في صفحة الدفع**

1. **اختر باقة** من صفحة الدفع
2. **اختر "بطاقة ائتمان/مدى"** كطريقة دفع
3. **اضغط "الدفع عبر البطاقة الإلكترونية"**
4. **سيتم فتح مودال الدفع** مع iframe لصفحة Geidea
5. **أكمل عملية الدفع** في المودال
6. **سيتم إغلاق المودال** وتوجيهك لصفحة النجاح

### 3. **معالجة النتائج**

```typescript
// معالجة النجاح
const handleSuccess = (response) => {
  console.log('Payment successful:', response);
  // تحديث حالة المستخدم
  // توجيه لصفحة النجاح
};

// معالجة الفشل
const handleFailure = (response) => {
  console.error('Payment failed:', response);
  // عرض رسالة خطأ
  // توجيه لصفحة الفشل
};
```

## 🔧 التكوين المطلوب

### 1. **Geidea Merchant Portal**

في Geidea Merchant Portal:
```
Webhook URL: https://yourdomain.com/api/geidea/webhook
Allowed Origins: https://yourdomain.com
```

### 2. **متغيرات البيئة**

أضف البيانات الحقيقية في `.env.local`:
```env
GEIDEA_MERCHANT_PUBLIC_KEY=your_real_merchant_public_key
GEIDEA_API_PASSWORD=your_real_api_password
GEIDEA_WEBHOOK_SECRET=your_real_webhook_secret
GEIDEA_BASE_URL=https://api.merchant.geidea.net
```

### 3. **إعادة تشغيل الخادم**

```bash
npm run dev
```

## 🧪 الاختبار

### 1. **اختبار التكوين**

```typescript
// في Developer Tools Console
window.debugSystem?.checkGeideaConfig();
```

### 2. **اختبار API**

```typescript
// في Developer Tools Console
window.debugSystem?.testPaymentAPI();
```

### 3. **اختبار Webhook**

```bash
# اختبار endpoint
curl http://localhost:3000/api/geidea/webhook
```

## 📁 الملفات المحدثة

### **API Endpoints**
- `src/app/api/geidea/create-session/route.ts` - إنشاء جلسة الدفع
- `src/app/api/geidea/webhook/route.ts` - معالجة webhooks

### **المكونات**
- `src/components/GeideaPaymentModal.tsx` - مودال الدفع
- `src/app/dashboard/payment/page.tsx` - صفحة الدفع الرئيسية

### **صفحات النتيجة**
- `src/app/dashboard/payment/success/page.tsx` - صفحة النجاح
- `src/app/dashboard/payment/failure/page.tsx` - صفحة الفشل

### **التكوين**
- `.env.local` - متغيرات البيئة
- `GEIDEA_REACT_NATIVE_INTEGRATION.md` - دليل التكامل
- `GEIDEA_SETUP_GUIDE.md` - دليل الإعداد

## 🔍 التشخيص

### **أدوات التشخيص**

```typescript
// فحص شامل للنظام
window.debugSystem?.fullSystemCheck();

// فحص تكوين Geidea
window.debugSystem?.checkGeideaConfig();

// اختبار API
window.debugSystem?.testPaymentAPI();
```

### **سجلات الخادم**

راقب سجلات الخادم للحصول على معلومات مفصلة:
```bash
# في terminal
npm run dev
```

## 🚨 استكشاف الأخطاء

### **مشاكل شائعة**

1. **"بيانات Geidea غير مكتملة"**
   - الحل: أضف البيانات في `.env.local`

2. **"فشل في إنشاء جلسة الدفع"**
   - الحل: تحقق من صحة بيانات Geidea

3. **"iframe لا يتحمل"**
   - الحل: تحقق من إعدادات CSP

4. **"رسائل من iframe لا تصل"**
   - الحل: تحقق من origin الرسائل

### **أدوات التشخيص**

```typescript
// في Developer Tools Console
console.log('🔍 System Status:', {
  geideaConfig: window.debugSystem?.checkGeideaConfig(),
  paymentAPI: window.debugSystem?.testPaymentAPI(),
  fullCheck: window.debugSystem?.fullSystemCheck()
});
```

## 📚 الوثائق

### **روابط مفيدة**
- [Geidea React Native Documentation](https://docs.geidea.net/docs/react-native)
- [Geidea API Reference](https://docs.geidea.net/docs/api-reference)
- [Geidea Test Cards](https://docs.geidea.net/docs/test-cards)

### **ملفات الدليل**
- `GEIDEA_REACT_NATIVE_INTEGRATION.md` - دليل التكامل التفصيلي
- `GEIDEA_SETUP_GUIDE.md` - دليل الإعداد السريع
- `TROUBLESHOOTING.md` - دليل استكشاف الأخطاء

## 🎉 النتيجة النهائية

### **المميزات المحققة**
- ✅ **تكامل كامل** مع Geidea API
- ✅ **واجهة مستخدم سلسة** مع مودال الدفع
- ✅ **أمان محسن** مع التوقيع والتحقق
- ✅ **معالجة شاملة** للنجاح والفشل
- ✅ **تشخيص متقدم** مع أدوات الفحص
- ✅ **وثائق شاملة** للاستخدام والصيانة

### **جاهز للاستخدام**
النظام الآن جاهز للاستخدام في بيئة الإنتاج مع:
- تكامل آمن مع Geidea
- واجهة مستخدم محسنة
- معالجة شاملة للأخطاء
- أدوات تشخيص متقدمة

---

**🎊 تهانينا! تم تحديث النظام بنجاح ليتوافق مع وثائق Geidea الرسمية ويوفر تجربة دفع سلسة وآمنة.** 
