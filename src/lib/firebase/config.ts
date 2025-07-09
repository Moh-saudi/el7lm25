// src/lib/firebase/config.ts
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { 
  getFirestore, 
  Firestore, 
  connectFirestoreEmulator,
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

// إظهار تحذير فقط في وضع التطوير وإذا كانت المتغيرات ناقصة
if (!hasValidConfig && process.env.NODE_ENV === 'development') {
  console.error('❌ Firebase environment variables are missing or using placeholder values.');
  console.error('Missing/placeholder variables:', missingVars);
  console.error('Please set proper Firebase configuration in your .env.local file');
  console.error('Current Firebase config:', requiredEnvVars);
}

// تكوين Firebase - استخدام متغيرات البيئة فقط
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// تكوين Geidea (server-side only) - بدون credentials مكشوفة
export const geideaConfig = {
  merchantPublicKey: process.env.GEIDEA_MERCHANT_PUBLIC_KEY || process.env.NEXT_PUBLIC_GEIDEA_MERCHANT_ID,
  apiPassword: process.env.GEIDEA_API_PASSWORD || process.env.NEXT_PUBLIC_GEIDEA_API_KEY,
  webhookSecret: process.env.GEIDEA_WEBHOOK_SECRET || 'default_webhook_secret',
  baseUrl: process.env.GEIDEA_BASE_URL || 'https://api.merchant.geidea.net',
  isTestMode: process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_GEIDEA_ENVIRONMENT === 'test'
};

// التحقق من صحة تكوين Geidea (server-side only)
const validateGeideaConfig = () => {
  // لا نتحقق من التكوين في المتصفح
  if (typeof window !== 'undefined') {
    return false;
  }

  const requiredFields = [
    'merchantPublicKey',
    'apiPassword',
    'webhookSecret'
  ];

  const missingFields = requiredFields.filter(field => {
    const value = geideaConfig[field as keyof typeof geideaConfig];
    return !value || 
           value === 'your_merchant_public_key_here' ||
           value === 'your_api_password_here' ||
           value === 'your_webhook_secret_here' ||
           value === 'test_merchant' ||
           value === 'test_api_key' ||
           value === 'default_webhook_secret';
  });

  if (missingFields.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('⚠️ Geidea configuration missing fields:', missingFields);
    console.warn('Please set proper Geidea credentials in your .env.local file');
  }

  return missingFields.length === 0;
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | null = null;
let storage: FirebaseStorage;

// Initialize Firebase only once
if (!getApps().length) {
  try {
    // التحقق من صحة التكوين قبل التهيئة
    if (!hasValidConfig) {
      console.error('❌ Firebase configuration is missing or invalid');
      console.error('Please set proper Firebase configuration in your .env.local file');
      console.error('Current config:', firebaseConfig);
      throw new Error('Firebase configuration is required');
    } else {
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

    // Initialize Firestore with simple settings
    db = getFirestore(app);
    
    // Enable network for better connection
    if (typeof window !== 'undefined') {
      enableNetwork(db).catch((error) => {
        console.warn('Failed to enable Firestore network:', error);
      });
    }

    storage = getStorage(app);

    // Initialize Analytics in browser only
    if (typeof window !== 'undefined') {
      try {
        analytics = getAnalytics(app);
      } catch (error) {
        console.warn('Analytics initialization failed:', error);
        analytics = null;
      }
    }

    console.log('✅ Firebase initialized successfully');
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    console.error('Firebase config used:', firebaseConfig);
    throw error;
  }
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  if (typeof window !== 'undefined' && !analytics) {
    try {
      analytics = getAnalytics(app);
    } catch {
      analytics = null;
    }
  }
}

// التحقق من صحة تكوين Firebase
function validateFirebaseConfig() {
  const requiredFields = [
    'apiKey',
    'authDomain', 
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];

  const missingFields = requiredFields.filter(field => {
    const value = firebaseConfig[field as keyof typeof firebaseConfig];
    return !value || value === 'your_firebase_api_key_here' || value === 'your_firebase_api_key';
  });

  if (missingFields.length > 0) {
    console.error('❌ Firebase configuration missing required fields:', missingFields);
    return false;
  }

  return true;
}

// Helper function to check Firestore connection
export const checkFirestoreConnection = async () => {
  try {
    // Try to enable network if it's disabled
    await enableNetwork(db);
    console.log('✅ Firestore connection verified');
    return true;
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    return false;
  }
};

// Helper function to retry operations with exponential backoff
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} in ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

// التحقق من تكوين Geidea
if (validateGeideaConfig()) {
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Geidea configuration validated');
  }
} else {
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️ Geidea configuration incomplete - some features may not work');
  }
}

// تصدير الخدمات المهيأة
export { app, auth, db, analytics, storage };

// Export configuration for debugging
export { firebaseConfig, hasValidConfig, missingVars };

// Export validation function
export { validateFirebaseConfig };
