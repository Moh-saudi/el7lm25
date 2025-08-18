# Firebase Setup Guide

## 🔥 إعداد Firebase للمشروع

### الخطوة 1: إنشاء مشروع Firebase

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. انقر على "Create a project" أو "إنشاء مشروع"
3. أدخل اسم المشروع (مثال: `el7lm25-app`)
4. اختر "Enable Google Analytics" إذا كنت تريد تحليلات متقدمة
5. انقر على "Create project"

### الخطوة 2: إضافة تطبيق الويب

1. في لوحة تحكم Firebase، انقر على أيقونة الويب `</>`
2. أدخل اسم التطبيق (مثال: `el7lm25-web`)
3. اختر "Also set up Firebase Hosting" إذا كنت تريد استضافة الموقع
4. انقر على "Register app"

### الخطوة 3: الحصول على بيانات التكوين

بعد تسجيل التطبيق، ستحصل على كود التكوين مثل هذا:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC-example-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

### الخطوة 4: تحديث ملف .env.local

استبدل القيم في ملف `.env.local` بالقيم الحقيقية من Firebase:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC-example-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### الخطوة 5: إعداد Firebase Admin SDK (اختياري)

للعمليات من جانب الخادم، تحتاج إلى Firebase Admin SDK:

1. في لوحة تحكم Firebase، اذهب إلى "Project settings"
2. انقر على "Service accounts"
3. انقر على "Generate new private key"
4. احفظ الملف JSON
5. استخرج القيم التالية:

```env
# Firebase Admin SDK
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour actual private key here\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PROJECT_ID=your-project-id
```

### الخطوة 6: إعداد Authentication

1. في لوحة تحكم Firebase، اذهب إلى "Authentication"
2. انقر على "Get started"
3. اختر "Email/Password" كطريقة تسجيل دخول
4. فعّل "Email/Password" provider

### الخطوة 7: إعداد Firestore Database

1. في لوحة تحكم Firebase، اذهب إلى "Firestore Database"
2. انقر على "Create database"
3. اختر "Start in test mode" للتطوير
4. اختر موقع قاعدة البيانات (مثال: `us-central1`)

### الخطوة 8: إعداد Storage

1. في لوحة تحكم Firebase، اذهب إلى "Storage"
2. انقر على "Get started"
3. اختر "Start in test mode" للتطوير
4. اختر موقع التخزين (مثال: `us-central1`)

### الخطوة 9: اختبار التكوين

بعد تحديث `.env.local`، أعد تشغيل الخادم:

```bash
npm run dev
```

يجب أن تختفي رسائل الخطأ المتعلقة بـ Firebase.

### ملاحظات مهمة:

1. **الأمان**: لا تشارك ملف `.env.local` أبداً
2. **الإنتاج**: في الإنتاج، استخدم متغيرات بيئة آمنة
3. **التحليلات**: `measurementId` اختياري - يمكن تركه فارغاً
4. **Admin SDK**: مطلوب فقط للعمليات من جانب الخادم

### استكشاف الأخطاء:

إذا ظهرت أخطاء Firebase:

1. تأكد من أن جميع المتغيرات في `.env.local` صحيحة
2. تأكد من أن المشروع مفعل في Firebase Console
3. تحقق من قواعد الأمان في Firestore و Storage
4. تأكد من أن Authentication مفعل

### روابط مفيدة:

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables) 