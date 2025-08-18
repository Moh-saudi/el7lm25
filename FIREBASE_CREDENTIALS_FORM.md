# 🔥 نموذج بيانات Firebase الحقيقية

## 📝 استبدل القيم التالية ببيانات Firebase الحقيقية الخاصة بك:

```env
# Firebase Configuration - استبدل هذه القيم بالبيانات الحقيقية
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC-your-actual-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-name.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-name
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-name.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 🔍 كيفية الحصول على هذه البيانات:

1. **اذهب إلى**: https://console.firebase.google.com/
2. **اختر مشروعك** أو أنشئ مشروع جديد
3. **اذهب إلى إعدادات المشروع** (⚙️)
4. **في قسم "Your apps"**، أضف تطبيق ويب (أيقونة `</>`)
5. **انسخ بيانات التكوين** التي ستظهر لك

## 📋 مثال على بيانات Firebase الحقيقية:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC-example-key-here",
  authDomain: "my-project.firebaseapp.com",
  projectId: "my-project",
  storageBucket: "my-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX"
};
```

## 🚨 ملاحظات مهمة:

- **لا تشارك بيانات Firebase مع أي شخص**
- **احتفظ بالبيانات آمنة**
- **لا تضع البيانات في Git**
- **استخدم متغيرات البيئة في الإنتاج**

---

**هل تريد مني مساعدتك في تحديث ملف .env.local بالبيانات الحقيقية؟** 