# تكامل Geidea مع React Native 🚀

بناءً على [وثائق Geidea الرسمية](https://docs.geidea.net/docs/react-native)، تم تحديث النظام ليدعم طريقتين للتكامل:

## 1. Geidea SDK Integration (الحل الأسهل) ✅

### المميزات:
- ✅ **Hosted Payment Form**: Geidea تستضيف نموذج الدفع
- ✅ **Card Payments**: دعم البطاقات الإلكترونية
- ✅ **Tokenization**: حفظ البطاقات للمدفوعات المستقبلية
- ✅ **Hosted Payment Page**: صفحة دفع مستضافة

### المتطلبات:
- React Native >= 0.63 up to 0.68
- Geidea Online Payments React Native SDK 6.1.0
- Android 6.0.2 أو أكبر

## 2. Custom Integration (الحل المخصص) ✅

### المميزات:
- ✅ **Merchant Hosted Form**: التطبيق يستضيف نموذج الدفع
- ✅ **Direct API Integration**: تكامل مباشر مع API
- ✅ **PCI-DSS**: يتطلب شهادة PCI-DSS للتاجر

## التحديثات المنجزة

### 1. API Endpoint محدث

```typescript
// POST /api/geidea/create-session
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
```

### 2. مكون React Native للدفع

```typescript
import GeideaPaymentModal from "@/components/GeideaPaymentModal";

// استخدام المودال
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
```

### 3. معالجة الرسائل من iframe

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

## كيفية الاستخدام

### في صفحة الدفع:

1. **اختر باقة** من صفحة الدفع
2. **اختر "بطاقة ائتمان/مدى"** كطريقة دفع
3. **اضغط "الدفع عبر البطاقة الإلكترونية"**
4. **سيتم فتح مودال الدفع** مع iframe لصفحة Geidea
5. **أكمل عملية الدفع** في المودال
6. **سيتم إغلاق المودال** وتوجيهك لصفحة النجاح

### في التطبيق:

```typescript
// فتح مودال الدفع
const handlePayment = () => {
  setShowGeideaModal(true);
};

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
};
```

## التكوين المطلوب

### 1. متغيرات البيئة

```env
# Geidea Configuration
GEIDEA_MERCHANT_PUBLIC_KEY=your_merchant_public_key
GEIDEA_API_PASSWORD=your_api_password
GEIDEA_WEBHOOK_SECRET=your_webhook_secret
GEIDEA_BASE_URL=https://api.merchant.geidea.net

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. تكوين Webhook

في Geidea Merchant Portal:
```
Webhook URL: https://yourdomain.com/api/geidea/webhook
```

## المميزات الجديدة

### 🔒 الأمان المحسن
- **التوقيع الآمن**: HMAC للتحقق من صحة الطلبات
- **iframe آمن**: عزل صفحة الدفع
- **معالجة الرسائل**: تحقق من origin الرسائل

### 🎨 واجهة مستخدم محسنة
- **مودال أنيق**: تصميم حديث ومتجاوب
- **حالات التحميل**: مؤشرات تحميل واضحة
- **معالجة الأخطاء**: رسائل خطأ واضحة

### 🔧 سهولة الاستخدام
- **تكامل سلس**: لا حاجة لترك الصفحة
- **معالجة تلقائية**: تحديث حالة المستخدم تلقائياً
- **تجربة موحدة**: نفس التصميم في جميع الأجهزة

## الاختبار

### في التطوير:
```typescript
// فحص التكوين
window.debugSystem?.checkGeideaConfig();

// اختبار API
window.debugSystem?.testPaymentAPI();

// فحص شامل
window.debugSystem?.fullSystemCheck();
```

### في الإنتاج:
1. **اختبر بمبالغ صغيرة**
2. **تحقق من webhooks**
3. **راجع سجلات الخادم**

## استكشاف الأخطاء

### مشاكل شائعة:

1. **"بيانات Geidea غير مكتملة"**
   - الحل: أضف البيانات في `.env.local`

2. **"فشل في إنشاء جلسة الدفع"**
   - الحل: تحقق من صحة بيانات Geidea

3. **"iframe لا يتحمل"**
   - الحل: تحقق من إعدادات CSP

4. **"رسائل من iframe لا تصل"**
   - الحل: تحقق من origin الرسائل

## الدعم

### روابط مفيدة:
- [Geidea React Native Documentation](https://docs.geidea.net/docs/react-native)
- [Geidea API Reference](https://docs.geidea.net/docs/api-reference)
- [Geidea Test Cards](https://docs.geidea.net/docs/test-cards)

### التشخيص:
```typescript
// في Developer Tools Console
window.debugSystem?.fullSystemCheck();
```

---

**🎉 النظام جاهز للاستخدام!**

تم تحديث النظام ليتوافق مع وثائق Geidea الرسمية ويوفر تجربة دفع سلسة وآمنة. 