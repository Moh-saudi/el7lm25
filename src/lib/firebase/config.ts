// src/lib/firebase/config.ts
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// التحقق من متغيرات البيئة
const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// التحقق من وجود المتغيرات المطلوبة
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value || value.includes('your_'))
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.warn('Missing or invalid Firebase environment variables:', missingVars);
  console.warn('Using fallback configuration...');
}

// تكوين Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDCQQxUbeQQrlty5HnF65-7TK0TB2zB7R4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "hagzzgo-87884.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "hagzzgo-87884",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "hagzzgo-87884.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "865241332465",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:865241332465:web:158ed5fb2f0a80eecf0750",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-RQ3ENTG6KJ"
};

// تكوين Geidea (server-side only)
export const geideaConfig = {
  merchantPublicKey: process.env.GEIDEA_MERCHANT_PUBLIC_KEY,
  apiPassword: process.env.GEIDEA_API_PASSWORD,
  webhookSecret: process.env.GEIDEA_WEBHOOK_SECRET,
  baseUrl: process.env.GEIDEA_BASE_URL || 'https://api.merchant.geidea.net',
  isTestMode: process.env.NODE_ENV === 'development'
};

// التحقق من صحة تكوين Geidea (server-side only)
const validateGeideaConfig = () => {
  // لا نتحقق من التكوين في المتصفح
  if (typeof window !== 'undefined') {
    return false; // دائماً نستخدم وضع الاختبار في المتصفح
  }

  const requiredFields = [
    'merchantPublicKey',
    'apiPassword',
    'webhookSecret'
  ];

  // التحقق من وجود الحقول وعدم كونها placeholder
  const missingFields = requiredFields.filter(field => {
    const value = geideaConfig[field as keyof typeof geideaConfig];
    return !value || 
           value === 'your_merchant_public_key_here' ||
           value === 'your_api_password_here' ||
           value === 'your_real_webhook_secret_here' ||
           value === 'your_webhook_secret_here';
  });

  if (missingFields.length > 0) {
    console.warn('⚠️ Geidea configuration missing fields:', missingFields);
    console.warn('Payment system will use test mode');
    return false;
  }

  return true;
};

// سجل توضيحي لقيم متغيرات البيئة الخاصة بـ Geidea (server-side only)
if (typeof window === 'undefined') {
  console.log('Geidea env:', {
    merchantPublicKey: process.env.GEIDEA_MERCHANT_PUBLIC_KEY,
    apiPassword: process.env.GEIDEA_API_PASSWORD,
    webhookSecret: process.env.GEIDEA_WEBHOOK_SECRET,
  });
}

// التحقق من صحة تكوين Firebase
const validateFirebaseConfig = () => {
  const requiredFields = [
    'apiKey',
    'authDomain', 
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];

  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);

  if (missingFields.length > 0) {
    console.error('❌ Firebase configuration missing required fields:', missingFields);
    console.error('Current config:', firebaseConfig);
    return false;
  }

  return true;
};

// تهيئة Firebase - التحقق من عدم تكرار التهيئة
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | null = null;
let storage: FirebaseStorage;

// تهيئة الخدمات فقط إذا لم يتم ذلك بالفعل
if (!getApps().length) {
  try {
    if (validateFirebaseConfig()) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      
      // تهيئة Analytics فقط في بيئة المتصفح
      if (typeof window !== 'undefined') {
        try {
          analytics = getAnalytics(app);
          console.log('Firebase Analytics initialized successfully');
        } catch (error) {
          console.warn('Analytics initialization failed:', error);
          analytics = null;
        }
      }
      
      console.log('Firebase initialized successfully');
    } else {
      console.error('❌ Firebase initialization failed due to missing configuration');
      throw new Error('Firebase configuration incomplete');
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw error;
  }
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // محاولة تهيئة Analytics إذا لم يتم ذلك
  if (typeof window !== 'undefined' && !analytics) {
    try {
      analytics = getAnalytics(app);
    } catch (error) {
      console.warn('Analytics initialization failed:', error);
      analytics = null;
    }
  }
}

// التحقق من تكوين Geidea
if (validateGeideaConfig()) {
  console.log('✅ Geidea configuration validated');
} else {
  console.log('⚠️ Geidea using test mode');
}

export { app, auth, db, analytics, storage };