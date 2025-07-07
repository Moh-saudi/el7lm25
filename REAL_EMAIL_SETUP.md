# 📧 دليل إعداد EmailJS لإرسال إيميلات حقيقية

## 🎯 الهدف
إرسال إيميلات حقيقية بدلاً من الاختبار فقط.

## ✅ الخطوات السريعة

### 1. إنشاء حساب EmailJS
1. اذهب إلى [EmailJS.com](https://www.emailjs.com/)
2. سجل حساب جديد (مجاني)
3. تحقق من بريدك الإلكتروني

### 2. إعداد Email Service
1. في لوحة التحكم، اذهب إلى **Email Services**
2. اضغط **Add New Service**
3. اختر **Gmail** (أو أي مزود آخر)
4. اتبع خطوات المصادقة
5. احفظ **Service ID**

### 3. إنشاء Email Template
1. اذهب إلى **Email Templates**
2. اضغط **Create New Template**
3. استخدم هذا الكود:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>رمز التحقق - {{platform_name}}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb;">{{platform_name}}</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">رمز التحقق من البريد الإلكتروني</h2>
            
            <p style="margin-bottom: 20px;">مرحباً {{user_name}}،</p>
            
            <p style="margin-bottom: 30px;">استخدم الرمز التالي للتحقق من بريدك الإلكتروني:</p>
            
            <div style="background: #2563eb; color: white; padding: 20px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                {{otp_code}}
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">
                هذا الرمز صالح لمدة 10 دقائق فقط
            </p>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
                <p style="color: #64748b; font-size: 12px;">
                    إذا لم تطلب هذا الرمز، يمكنك تجاهل هذا الإيميل.<br>
                    للدعم الفني: {{support_email}}
                </p>
            </div>
        </div>
    </div>
</body>
</html>
```

4. احفظ Template واحصل على **Template ID**

### 4. الحصول على Public Key
1. اذهب إلى **Account > API Keys**
2. انسخ **Public Key**

### 5. تحديث متغيرات البيئة
أضف هذه المتغيرات إلى ملف `.env.local`:

```bash
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id_here
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id_here
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key_here
```

### 6. اختبار الإرسال
1. اذهب إلى: `http://localhost:3000/test-real-email`
2. أدخل بريد إلكتروني حقيقي
3. اضغط "📧 إرسال إيميل حقيقي"
4. تحقق من وصول الإيميل

## 🔧 استكشاف الأخطاء

### مشاكل شائعة:

#### 1. **خطأ في Gmail**
```
❌ Authentication failed
```
**الحل:**
- اذهب إلى [Google Account Settings](https://myaccount.google.com/)
- اذهب إلى **Security**
- فعّل **2-Step Verification**
- أنشئ **App Password**
- استخدم App Password بدلاً من كلمة المرور العادية

#### 2. **خطأ في Service ID**
```
❌ Service not found
```
**الحل:** تحقق من Service ID في EmailJS Dashboard

#### 3. **خطأ في Template ID**
```
❌ Template not found
```
**الحل:** تحقق من Template ID في EmailJS Dashboard

#### 4. **خطأ في Public Key**
```
❌ Invalid API key
```
**الحل:** تحقق من Public Key في Account > API Keys

## 📧 اختبار شامل

### صفحة الاختبار الجديدة:
- **الرابط:** `http://localhost:3000/test-real-email`
- **الميزات:**
  - عرض إعدادات EmailJS
  - سجلات مفصلة للعملية
  - رسائل خطأ واضحة
  - اختبار API OTP
  - مسح السجلات

### ما ستجده في السجلات:
```
🚀 بدء إرسال إيميل حقيقي...
📧 البريد الإلكتروني: your-email@gmail.com
👤 الاسم: Your Name
⚙️ Service ID: service_xxxxx
📝 Template ID: template_xxxxx
🔑 Public Key: xxxxxxxx...
📧 إعداد معاملات الإيميل...
📧 معاملات الإيميل جاهزة
📧 إرسال الإيميل عبر EmailJS...
✅ تم إرسال الإيميل بنجاح!
```

## 🎯 النتيجة المتوقعة

بعد الإعداد الصحيح:
- ✅ **الإيميل يُرسل فعلياً** إلى البريد الإلكتروني
- ✅ **OTP يظهر في الإيميل** بشكل جميل
- ✅ **رسالة نجاح** في التطبيق
- ✅ **سجلات مفصلة** في صفحة الاختبار
- ✅ **لا توجد أخطاء** في Terminal

## 📞 الدعم

إذا واجهت مشاكل:
1. تحقق من [EmailJS Documentation](https://www.emailjs.com/docs/)
2. استخدم صفحة `/test-real-email` للحصول على تفاصيل الخطأ
3. تحقق من إعدادات Gmail (App Password)
4. تأكد من صحة جميع المفاتيح

---

**🎉 بعد الإعداد، ستتمكن من إرسال إيميلات حقيقية بدلاً من الاختبار فقط!** 