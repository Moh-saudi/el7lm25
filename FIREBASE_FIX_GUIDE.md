# دليل إصلاح مشاكل Firebase Authentication

## المشكلة الحالية: 400 Bad Request

### الأعراض:
- خطأ `POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=... 400 (Bad Request)`
- فشل في تسجيل الدخول والتسجيل

### الأسباب المحتملة:

## 1. تفعيل Email/Password Authentication

**المشكلة**: Email/Password authentication غير مفعل في Firebase Console

**الحل**:
1. اذهب إلى [Firebase Console](https://console.firebase.google.com)
2. اختر مشروعك `hagzzgo-87884`
3. اذهب إلى **Authentication** > **Sign-in method**
4. ابحث عن **Email/Password**
5. اضغط على **Enable**
6. تأكد من تفعيل **Email/Password** (الخيار الأول)
7. احفظ التغييرات

## 2. إعدادات Authorized Domains

**المشكلة**: Domain غير مصرح به

**الحل**:
1. في Firebase Console > Authentication > Settings
2. اذهب إلى **Authorized domains**
3. تأكد من وجود:
   - `localhost`
   - `hagzzgo-87884.firebaseapp.com`
   - أي domain آخر تستخدمه

## 3. قواعد Firestore Security

**المشكلة**: قواعد Firestore تمنع الكتابة

**الحل**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read and write to role-specific collections
    match /{collection}/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow test documents for connection testing
    match /test/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 4. فحص متغيرات البيئة

تأكد من أن ملف `.env.local` يحتوي على:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDCQQxUbeQQrlty5HnF65-7TK0TB2zB7R4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=hagzzgo-87884.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hagzzgo-87884
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=hagzzgo-87884.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=865241332465
NEXT_PUBLIC_FIREBASE_APP_ID=1:865241332465:web:158ed5fb2f0a80eecf0750
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-RQ3ENTG6KJ
```

## 5. إعادة تشغيل الخادم

بعد أي تغيير في متغيرات البيئة:

```bash
# إيقاف الخادم (Ctrl+C)
npm run dev
```

## أدوات التشخيص

### صفحة التشخيص السريع:
- انتقل إلى: `http://localhost:3001/fix-firebase`
- اضغط على "فحص الإعدادات"
- اضغط على "اختبار التحقق"

### صفحة التشخيص الشامل:
- انتقل إلى: `http://localhost:3001/test-firebase-diagnosis`

## خطوات الإصلاح السريع

1. **افتح Firebase Console**:
   ```
   https://console.firebase.google.com/project/hagzzgo-87884/authentication/providers
   ```

2. **فعّل Email/Password**:
   - اضغط على Email/Password
   - فعّل الخيار الأول
   - احفظ

3. **تحقق من Authorized Domains**:
   - اذهب إلى Settings tab
   - تأكد من وجود localhost

4. **اختبر النظام**:
   - انتقل إلى `http://localhost:3001/fix-firebase`
   - اضغط "اختبار التحقق"

## إذا استمرت المشكلة

1. **تحقق من Console Logs**:
   - افتح Developer Tools (F12)
   - اذهب إلى Console tab
   - ابحث عن أخطاء Firebase

2. **تحقق من Network Tab**:
   - اذهب إلى Network tab
   - ابحث عن requests فاشلة
   - تحقق من response details

3. **تحقق من Firebase Project Settings**:
   - تأكد من أن Project ID صحيح
   - تأكد من أن API Key صحيح

## معلومات الاتصال للدعم

إذا لم تحل المشكلة:
1. انتقل إلى صفحة التشخيص وانسخ النتائج
2. تحقق من Firebase Console مرة أخرى
3. تأكد من إعادة تشغيل الخادم بعد أي تغيير 