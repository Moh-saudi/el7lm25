# 📧 دليل إعداد EmailJS لإرسال الإيميلات الحقيقية

## 🎯 المشكلة الحالية
الآن الـ API يعمل بنجاح، لكن **الإيميل الحقيقي لا يُرسل** - فقط يتم إنشاء OTP وتخزينه في الذاكرة.

## ✅ الحل: إعداد EmailJS

### 1. إنشاء حساب EmailJS
1. اذهب إلى [EmailJS.com](https://www.emailjs.com/)
2. سجل حساب جديد (مجاني)
3. تحقق من بريدك الإلكتروني

### 2. إعداد Email Service
1. في لوحة التحكم، اذهب إلى **Email Services**
2. أضف خدمة جديدة (Gmail, Outlook, أو أي SMTP)
3. اتبع التعليمات للربط مع بريدك الإلكتروني

### 3. إنشاء Email Template
1. اذهب إلى **Email Templates**
2. أنشئ template جديد باسم `verification_otp`
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

### 4. الحصول على المفاتيح
بعد إنشاء Service و Template، احصل على:

1. **Service ID** - من صفحة Email Services
2. **Template ID** - من صفحة Email Templates  
3. **Public Key** - من صفحة Account > API Keys

### 5. تحديث متغيرات البيئة
أضف هذه المتغيرات إلى ملف `.env.local`:

```bash
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id_here
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id_here
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key_here
```

### 6. اختبار الإعداد
1. اذهب إلى: `http://localhost:3000/test-emailjs`
2. أدخل بريد إلكتروني واسم
3. اضغط "📧 إرسال إيميل تجريبي"
4. تحقق من وصول الإيميل

## 🔧 استكشاف الأخطاء

### مشاكل شائعة:

#### 1. **خطأ في Service ID**
```
❌ خطأ في إرسال الإيميل: Service not found
```
**الحل:** تحقق من Service ID في EmailJS Dashboard

#### 2. **خطأ في Template ID**
```
❌ خطأ في إرسال الإيميل: Template not found
```
**الحل:** تحقق من Template ID في EmailJS Dashboard

#### 3. **خطأ في Public Key**
```
❌ خطأ في إرسال الإيميل: Invalid API key
```
**الحل:** تحقق من Public Key في Account > API Keys

#### 4. **خطأ في الربط مع Gmail**
```
❌ خطأ في إرسال الإيميل: Authentication failed
```
**الحل:** 
- تأكد من تفعيل "Less secure app access" في Gmail
- أو استخدم App Password بدلاً من كلمة المرور العادية

## 📋 خطوات التطبيق

1. **إنشاء حساب EmailJS** ✅
2. **إعداد Email Service** ✅
3. **إنشاء Email Template** ✅
4. **الحصول على المفاتيح** ✅
5. **تحديث متغيرات البيئة** ✅
6. **اختبار الإرسال** 🔄

## 🎯 النتيجة المتوقعة

بعد الإعداد الصحيح:
- ✅ **الإيميل يُرسل فعلياً** إلى البريد الإلكتروني
- ✅ **OTP يظهر في الإيميل** بشكل جميل
- ✅ **رسالة نجاح** في التطبيق
- ✅ **لا توجد أخطاء** في Terminal

## 📞 الدعم

إذا واجهت مشاكل:
1. تحقق من [EmailJS Documentation](https://www.emailjs.com/docs/)
2. تأكد من صحة المفاتيح
3. اختبر من صفحة `/test-emailjs`
4. تحقق من Console للحصول على رسائل الخطأ

## 🔄 التحديث التالي

بعد إعداد EmailJS بنجاح، يمكن:
- إضافة قوالب إيميلات أخرى (ترحيب، إعادة تعيين كلمة المرور)
- تحسين تصميم الإيميلات
- إضافة إشعارات SMS
- ربط مع خدمات إيميل أخرى 