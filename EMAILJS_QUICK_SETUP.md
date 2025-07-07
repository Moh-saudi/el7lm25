# دليل إعداد EmailJS السريع

## 📧 الإعدادات الحالية

تم تحديث ملف `.env.local` بالإعدادات التالية:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_hagzz
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_o29zcgp
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=huej76QaxY2rtoAee
```

## 🚀 خطوات الإعداد السريع

### 1. إنشاء Service في EmailJS
1. اذهب إلى [EmailJS.com](https://www.emailjs.com/)
2. سجل دخول أو أنشئ حساب جديد
3. اذهب إلى **Email Services**
4. انقر على **Add New Service**
5. اختر **Gmail** أو مزود البريد الإلكتروني المفضل
6. اتبع خطوات المصادقة
7. انسخ **Service ID** (مثال: `service_hagzz`)

### 2. إنشاء Template في EmailJS
1. اذهب إلى **Email Templates**
2. انقر على **Create New Template**
3. استخدم القالب التالي:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>رمز التحقق - ClubLand</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">ClubLand</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">رمز التحقق من البريد الإلكتروني</p>
    </div>

    <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
        <h2 style="color: #2c3e50; margin-top: 0;">مرحباً {{to_name}}!</h2>
        
        <p>شكراً لك على التسجيل في ClubLand. لاستكمال عملية التسجيل، يرجى استخدام رمز التحقق التالي:</p>
        
        <div style="background: #e8f4fd; border: 2px dashed #3498db; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin: 0 0 10px 0;">رمز التحقق</h3>
            <div style="font-size: 32px; font-weight: bold; color: #3498db; letter-spacing: 5px; font-family: 'Courier New', monospace;">
                {{otp_code}}
            </div>
        </div>
        
        <p style="color: #7f8c8d; font-size: 14px;">
            ⏰ هذا الرمز صالح لمدة {{expiry_minutes}} دقائق فقط
        </p>
    </div>

    <div style="background: #ecf0f1; padding: 20px; border-radius: 8px; text-align: center;">
        <p style="margin: 0; color: #7f8c8d; font-size: 14px;">
            إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني
        </p>
    </div>

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
        <p style="color: #7f8c8d; font-size: 12px; margin: 0;">
            © 2024 {{app_name}}. جميع الحقوق محفوظة
        </p>
        <p style="color: #7f8c8d; font-size: 12px; margin: 5px 0 0 0;">
            للدعم: <a href="mailto:{{support_email}}" style="color: #3498db;">{{support_email}}</a>
        </p>
    </div>

</body>
</html>
```

4. احفظ القالب
5. انسخ **Template ID** (مثال: `template_o29zcgp`)

### 3. اختبار النظام

#### الطريقة الأولى: صفحة الاختبار السريع
1. اذهب إلى: `http://localhost:3000/test-emailjs-quick`
2. تحقق من حالة الإعدادات
3. أدخل بريد إلكتروني للاختبار
4. انقر على "إرسال رمز التحقق"
5. تحقق من وصول البريد الإلكتروني

#### الطريقة الثانية: صفحة الإعدادات
1. اذهب إلى: `http://localhost:3000/emailjs-setup`
2. تحقق من الإعدادات
3. انقر على "إرسال بريد اختبار"

#### الطريقة الثالثة: صفحة التسجيل
1. اذهب إلى: `http://localhost:3000/auth/register`
2. املأ النموذج
3. سيتم إرسال رمز التحقق تلقائياً

## 🔧 متغيرات القالب المطلوبة

يجب أن يحتوي قالب EmailJS على المتغيرات التالية:

- `{{to_email}}` - البريد الإلكتروني للمستقبل
- `{{to_name}}` - اسم المستخدم
- `{{otp_code}}` - رمز التحقق (6 أرقام)
- `{{expiry_minutes}}` - مدة صلاحية الرمز (10 دقائق)
- `{{app_name}}` - اسم التطبيق (ClubLand)
- `{{support_email}}` - بريد الدعم

## 📱 الصفحات المتاحة

### صفحات الاختبار
- `/test-emailjs-quick` - اختبار سريع مع عداد الوقت
- `/test-emailjs` - اختبار شامل
- `/test-registration` - اختبار عملية التسجيل الكاملة

### صفحات الإعداد
- `/emailjs-setup` - إعدادات EmailJS
- `/auth/register` - صفحة التسجيل مع التحقق

## 🛠️ استكشاف الأخطاء

### مشاكل شائعة:

1. **"إعدادات EmailJS غير مكتملة"**
   - تحقق من ملف `.env.local`
   - تأكد من وجود جميع المتغيرات المطلوبة

2. **"خطأ في قالب البريد الإلكتروني"**
   - تحقق من Template ID
   - تأكد من وجود جميع المتغيرات المطلوبة في القالب

3. **"خطأ في خدمة البريد الإلكتروني"**
   - تحقق من Service ID
   - تأكد من تفعيل الخدمة في EmailJS

4. **"خطأ في مفتاح API"**
   - تحقق من Public Key
   - تأكد من صحة المفتاح

### رسائل الخطأ المفصلة:
- `Invalid template` - خطأ في Template ID
- `Invalid service` - خطأ في Service ID  
- `Invalid public key` - خطأ في Public Key
- `rate limit` - تجاوز الحد المسموح من الرسائل

## 📊 مراقبة الأداء

### في Console المتصفح:
```
✅ تم تحميل إعدادات EmailJS من متغيرات البيئة
📧 إرسال OTP إلى: user@example.com
🔑 رمز OTP: 123456
✅ تم إرسال OTP بنجاح
```

### في Network Tab:
- تحقق من طلبات EmailJS
- تأكد من عدم وجود أخطاء 4xx أو 5xx

## 🔒 الأمان

- يتم حذف OTP تلقائياً بعد 10 دقائق
- يتم حذف OTP بعد التحقق الناجح
- يتم تنظيف OTP منتهي الصلاحية تلقائياً
- لا يتم حفظ OTP في قاعدة البيانات

## 📞 الدعم

إذا واجهت أي مشاكل:
1. تحقق من Console المتصفح للأخطاء
2. تحقق من Network Tab للطلبات الفاشلة
3. راجع دليل EmailJS الرسمي
4. تأكد من صحة جميع الإعدادات

---

**تم التحديث في:** ديسمبر 2024  
**الإصدار:** 2.0  
**الحالة:** جاهز للاستخدام ✅ 