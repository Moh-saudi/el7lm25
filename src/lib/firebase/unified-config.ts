// إعدادات Firebase الموحدة - لتجنب التكرار
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { 
  getFirestore, 
  Firestore, 
  enableNetwork,
  disableNetwork
} from "firebase/firestore";
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
  .filter(([key, value]) => !value || value === 'your_firebase_api_key_here' || value === 'your_firebase_api_key')
  .map(([key]) => key);

const hasValidConfig = missingVars.length === 0;

// تكوين Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// متغيرات Firebase الموحدة
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | null = null;
let storage: FirebaseStorage;

// تهيئة Firebase مرة واحدة فقط
const initializeFirebase = () => {
  if (getApps().length > 0) {
    // Firebase تم تهيئته مسبقاً
    app = getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    if (typeof window !== 'undefined') {
      try {
        analytics = getAnalytics(app);
      } catch (error) {
        console.warn('Analytics initialization failed:', error);
        analytics = null;
      }
    }
    
    return { app, auth, db, analytics, storage };
  }

  try {
    // التحقق من صحة التكوين قبل التهيئة
    if (!hasValidConfig) {
      console.error('❌ Firebase configuration is missing or invalid');
      console.error('Please set proper Firebase configuration in your .env.local file');
      throw new Error('Firebase configuration is required');
    }

    console.log('🔧 Initializing Firebase with config:', {
      apiKey: firebaseConfig.apiKey ? '✅ Set' : '❌ Missing',
      authDomain: firebaseConfig.authDomain ? '✅ Set' : '❌ Missing',
      projectId: firebaseConfig.projectId ? '✅ Set' : '❌ Missing',
      storageBucket: firebaseConfig.storageBucket ? '✅ Set' : '❌ Missing',
      messagingSenderId: firebaseConfig.messagingSenderId ? '✅ Set' : '❌ Missing',
      appId: firebaseConfig.appId ? '✅ Set' : '❌ Missing',
      measurementId: firebaseConfig.measurementId ? '✅ Set' : '❌ Missing'
    });

    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // تفعيل الشبكة لتحسين الاتصال
    if (typeof window !== 'undefined') {
      enableNetwork(db).catch((error) => {
        console.warn('Failed to enable Firestore network:', error);
      });
    }

    // تهيئة Analytics في المتصفح فقط
    if (typeof window !== 'undefined') {
      try {
        analytics = getAnalytics(app);
      } catch (error) {
        console.warn('Analytics initialization failed:', error);
        analytics = null;
      }
    }

    console.log('✅ Firebase initialized successfully');
    
    return { app, auth, db, analytics, storage };
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw error;
  }
};

// الحصول على مثيلات Firebase
const getFirebaseInstances = () => {
  if (!app) {
    return initializeFirebase();
  }
  return { app, auth, db, analytics, storage };
};

// تصدير المثيلات
const { app: firebaseApp, auth: firebaseAuth, db: firebaseDb, analytics: firebaseAnalytics, storage: firebaseStorage } = getFirebaseInstances();

export {
  firebaseApp as app,
  firebaseAuth as auth,
  firebaseDb as db,
  firebaseAnalytics as analytics,
  firebaseStorage as storage,
  getFirebaseInstances,
  initializeFirebase
};

// تصدير افتراضي للتوافق مع الكود القديم
export default {
  app: firebaseApp,
  auth: firebaseAuth,
  db: firebaseDb,
  analytics: firebaseAnalytics,
  storage: firebaseStorage
}; 