# دليل إعداد Geidea السريع 🚀

## المشكلة الحالية

النظام يعمل في وضع الاختبار لأن بيانات Geidea غير مُعرفة. هذا يعني:
- ❌ لا يتم التوجيه لصفحة Geidea
- ✅ يتم عرض رسالة نجاح في التطوير فقط

## الحل السريع

### 1. الحصول على بيانات Geidea

1. **سجل في Geidea Merchant Portal**:
   - اذهب إلى [https://merchant.geidea.net](https://merchant.geidea.net)
   - سجل حساب جديد أو سجل دخول

2. **احصل على البيانات المطلوبة**:
   - **Merchant Public Key**: من لوحة التحكم
   - **API Password**: من إعدادات API
   - **Webhook Secret**: من إعدادات Webhook

### 2. تحديث ملف `.env.local`

```env
# Geidea Payment Gateway Configuration
GEIDEA_MERCHANT_PUBLIC_KEY=your_actual_merchant_key_here
GEIDEA_API_PASSWORD=your_actual_api_password_here
GEIDEA_WEBHOOK_SECRET=your_actual_webhook_secret_here
GEIDEA_BASE_URL=https://api.merchant.geidea.net
```

### 3. إعادة تشغيل الخادم

```bash
# أوقف الخادم (Ctrl+C)
# ثم أعد تشغيله
npm run dev
```

## اختبار النظام

### في التطوير (مع بيانات Geidea الحقيقية):

1. **اختر باقة** من صفحة الدفع
2. **اضغط "دفع عبر Geidea"**
3. **سيتم توجيهك لصفحة Geidea** لإدخال بيانات البطاقة
4. **أكمل عملية الدفع**
5. **سيتم توجيهك لصفحة النجاح**

### في الإنتاج:

1. **تأكد من تكوين Webhook URL** في Geidea Portal:
   ```
   https://yourdomain.com/api/geidea/webhook
   ```

2. **اختبر الدفع بمبالغ صغيرة**

## تشخيص المشاكل

### فحص التكوين:

```typescript
// في Developer Tools Console
window.debugSystem?.checkGeideaConfig();
```

### فحص شامل:

```typescript
// في Developer Tools Console
window.debugSystem?.fullSystemCheck();
```

## رسائل الخطأ الشائعة

### "بيانات Geidea غير مكتملة"
- **الحل**: أضف البيانات المطلوبة في `.env.local`

### "فشل في إنشاء جلسة الدفع"
- **الحل**: تحقق من صحة بيانات Geidea
- **الحل**: تأكد من أن الخادم يعمل

### "لم يتم استلام رابط الدفع"
- **الحل**: تحقق من استجابة Geidea API
- **الحل**: راجع سجلات الخادم

## ملاحظات مهمة

1. **في التطوير**: يمكنك استخدام بيانات Geidea الحقيقية للاختبار
2. **في الإنتاج**: تأكد من تكوين Webhook URL بشكل صحيح
3. **الأمان**: لا تشارك بيانات Geidea مع أي شخص
4. **النسخ الاحتياطي**: احتفظ بنسخة من بيانات Geidea في مكان آمن

## الدعم

إذا واجهت مشاكل:
1. راجع سجلات الخادم
2. استخدم أدوات التشخيص
3. تحقق من وثائق Geidea
4. راجع ملف `TROUBLESHOOTING.md`

---

**🎯 الهدف**: الحصول على بيانات Geidea الحقيقية وإضافتها لملف `.env.local` ثم إعادة تشغيل الخادم. 
