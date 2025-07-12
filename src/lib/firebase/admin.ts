import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let isInitialized = false;

export function initializeFirebaseAdmin() {
  if (isInitialized || getApps().length > 0) {
    return;
  }

  try {
    console.log('🔧 Initializing Firebase Admin SDK...');
    
    // التحقق من المتغيرات البيئية المطلوبة
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    
    console.log('📋 Environment variables check:');
    console.log('Project ID:', projectId ? '✅ Set' : '❌ Missing');
    console.log('Private Key:', privateKey ? '✅ Set' : '❌ Missing');
    console.log('Client Email:', clientEmail ? '✅ Set' : '❌ Missing');
    
    if (!projectId) {
      throw new Error('FIREBASE_PROJECT_ID is required');
    }
    
    if (privateKey && clientEmail) {
      // استخدام service account credentials
      console.log('🔐 Using service account credentials');
      
      // تنظيف private key (إزالة الاقتباسات إذا وجدت)
      const cleanPrivateKey = privateKey.replace(/\\n/g, '\n');
      
      initializeApp({
        credential: cert({
          projectId: projectId,
          privateKey: cleanPrivateKey,
          clientEmail: clientEmail,
        }),
        projectId: projectId,
      });
      
      console.log('✅ Firebase Admin initialized with service account');
    } else {
      // استخدام default credentials (في production أو development)
      console.log('🔐 Using default credentials');
      
      initializeApp({
        projectId: projectId,
      });
      
      console.log('✅ Firebase Admin initialized with default credentials');
    }
    
    isInitialized = true;
    
  } catch (error: any) {
    console.error('❌ Failed to initialize Firebase Admin:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    console.log('💡 Troubleshooting tips:');
    console.log('1. Check FIREBASE_PROJECT_ID environment variable');
    console.log('2. Verify FIREBASE_PRIVATE_KEY format (should include \\n)');
    console.log('3. Ensure FIREBASE_CLIENT_EMAIL is correct');
    console.log('4. Download service account key from Firebase Console');
    console.log('5. Make sure .env.local file exists and is loaded');
    
    // لا نرمي الخطأ، فقط نتركه للتعامل معه لاحقاً
  }
}

export function getAdminDb() {
  initializeFirebaseAdmin();
  return getFirestore();
}

// تهيئة تلقائية للتوافق مع الكود القديم
if (typeof window === 'undefined') {
  initializeFirebaseAdmin();
} 
export const adminDb = getFirestore(); 