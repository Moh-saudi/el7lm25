# دليل استكشاف أخطاء Firebase

## 🔥 المشكلة الحالية
```
FirebaseError: Installations: Create Installation request failed with error "400 INVALID_ARGUMENT: API key not valid. Please pass a valid API key."
```

## ✅ الحلول المطبقة

### 1. إصلاح ملف البيئة
تم إزالة الإعدادات المكررة والخاطئة من ملف `.env.local`:

**قبل الإصلاح:**
```env
# إعدادات صحيحة في الأعلى
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDCQQxUbeQQrlty5HnF65-7TK0TB2zB7R4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=hagzzgo-87884.firebaseapp.com
# ... إعدادات أخرى صحيحة

# إعدادات خاطئة في الأسفل (تم حذفها)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
# ... إعدادات أخرى خاطئة
```

**بعد الإصلاح:**
```env
# إعدادات Firebase الصحيحة فقط
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDCQQxUbeQQrlty5HnF65-7TK0TB2zB7R4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=hagzzgo-87884.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hagzzgo-87884
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=hagzzgo-87884.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=865241332465
NEXT_PUBLIC_FIREBASE_APP_ID=1:865241332465:web:158ed5fb2f0a80eecf0750
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-RQ3ENTG6KJ
```

### 2. تحسين ملف تكوين Firebase
تم إضافة تحقق أفضل من الإعدادات ورسائل خطأ أكثر وضوحاً:

```typescript
// التحقق من صحة التكوين قبل التهيئة
if (!hasValidConfig) {
  throw new Error(`Firebase configuration is invalid. Missing: ${missingVars.join(', ')}`);
}

console.log('🔧 Initializing Firebase with config:', {
  apiKey: firebaseConfig.apiKey ? '✅ Set' : '❌ Missing',
  authDomain: firebaseConfig.authDomain ? '✅ Set' : '❌ Missing',
  // ... باقي الإعدادات
});
```

### 3. إنشاء صفحة اختبار Firebase
تم إنشاء صفحة `/test-firebase` للتحقق من الإعدادات:

- عرض حالة جميع إعدادات Firebase
- اختبار المصادقة
- عرض تفاصيل الإعدادات
- رسائل خطأ واضحة

## 🧪 اختبار الإصلاح

### 1. اختبار سريع
اذهب إلى: `http://localhost:3001/test-firebase`

### 2. التحقق من Console
افتح Developer Tools وتحقق من Console للأخطاء:

```javascript
// يجب أن ترى هذه الرسائل:
✅ Firebase initialized successfully
🔧 Initializing Firebase with config: { apiKey: "✅ Set", ... }
```

### 3. اختبار المصادقة
في صفحة الاختبار، انقر على "تسجيل دخول تجريبي"

## 🛠️ خطوات إضافية إذا استمرت المشكلة

### 1. التحقق من إعدادات Firebase Console
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك: `hagzzgo-87884`
3. اذهب إلى Project Settings
4. تحقق من أن API Key صحيح
5. تأكد من تفعيل Authentication

### 2. التحقق من قواعد الأمان
1. اذهب إلى Authentication > Sign-in method
2. تأكد من تفعيل "Anonymous" authentication
3. اذهب إلى Firestore > Rules
4. تحقق من قواعد الأمان

### 3. إعادة تشغيل الخادم
```bash
# إيقاف الخادم
Ctrl + C

# حذف cache
rm -rf .next

# إعادة تشغيل
npm run dev
```

## 📋 قائمة التحقق

- [ ] ملف `.env.local` يحتوي على إعدادات صحيحة فقط
- [ ] لا توجد إعدادات مكررة
- [ ] جميع متغيرات Firebase مكتملة
- [ ] Firebase Console يعرض نفس الإعدادات
- [ ] Authentication مفعل في Firebase Console
- [ ] الخادم يعمل على المنفذ الصحيح (3001)
- [ ] صفحة `/test-firebase` تعمل بشكل صحيح

## 🔍 رسائل الخطأ الشائعة

### "API key not valid"
**السبب:** API Key غير صحيح أو غير موجود
**الحل:** تحقق من `NEXT_PUBLIC_FIREBASE_API_KEY` في `.env.local`

### "Project not found"
**السبب:** Project ID غير صحيح
**الحل:** تحقق من `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

### "Auth domain not authorized"
**السبب:** Auth Domain غير صحيح
**الحل:** تحقق من `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`

### "App not found"
**السبب:** App ID غير صحيح
**الحل:** تحقق من `NEXT_PUBLIC_FIREBASE_APP_ID`

## 📞 الدعم

إذا استمرت المشكلة:
1. تحقق من Console المتصفح للأخطاء
2. راجع Firebase Console
3. تأكد من صحة جميع الإعدادات
4. جرب إعادة تشغيل الخادم

---

**تم التحديث في:** ديسمبر 2024  
**الإصدار:** 1.0  
**الحالة:** تم الإصلاح ✅ 