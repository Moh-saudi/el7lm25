// أداة تشخيص نوع الحساب
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface AccountDebugInfo {
  uid: string;
  email: string;
  foundInUsers: boolean;
  usersData?: any;
  foundInCollections: string[];
  collectionsData: { [key: string]: any };
  detectedAccountType?: string;
  recommendedAction: string;
}

export async function debugAccountType(uid: string, email: string): Promise<AccountDebugInfo> {
  const debugInfo: AccountDebugInfo = {
    uid,
    email,
    foundInUsers: false,
    foundInCollections: [],
    collectionsData: {},
    recommendedAction: ''
  };

  try {
    // فحص users collection
    console.log('🔍 Checking users collection...');
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      debugInfo.foundInUsers = true;
      debugInfo.usersData = userDoc.data();
      debugInfo.detectedAccountType = debugInfo.usersData.accountType;
      console.log('✅ Found in users collection:', debugInfo.usersData);
    } else {
      console.log('❌ Not found in users collection');
    }

    // فحص role-specific collections
    const collections = ['clubs', 'academies', 'trainers', 'agents', 'players'];
    
    for (const collection of collections) {
      console.log(`🔍 Checking ${collection} collection...`);
      const roleRef = doc(db, collection, uid);
      const roleDoc = await getDoc(roleRef);
      
      if (roleDoc.exists()) {
        const data = roleDoc.data();
        debugInfo.foundInCollections.push(collection);
        debugInfo.collectionsData[collection] = data;
        
        // تحديد نوع الحساب من اسم المجموعة
        if (!debugInfo.detectedAccountType) {
          debugInfo.detectedAccountType = collection.slice(0, -1); // إزالة 's' من النهاية
        }
        
        console.log(`✅ Found in ${collection}:`, data);
      } else {
        console.log(`❌ Not found in ${collection}`);
      }
    }

    // تحديد الإجراء المقترح
    if (debugInfo.foundInUsers && debugInfo.foundInCollections.length > 0) {
      debugInfo.recommendedAction = 'Account properly configured';
    } else if (!debugInfo.foundInUsers && debugInfo.foundInCollections.length > 0) {
      debugInfo.recommendedAction = `Create users document with accountType: ${debugInfo.detectedAccountType}`;
    } else if (debugInfo.foundInUsers && debugInfo.foundInCollections.length === 0) {
      debugInfo.recommendedAction = `Create role document in ${debugInfo.detectedAccountType}s collection`;
    } else {
      debugInfo.recommendedAction = 'Account needs complete setup';
    }

    return debugInfo;

  } catch (error) {
    console.error('Error debugging account type:', error);
    debugInfo.recommendedAction = `Error occurred: ${error}`;
    return debugInfo;
  }
}

// دالة للتحقق من المستخدم الحالي
export async function debugCurrentUser() {
  if (typeof window === 'undefined') return;
  
  // استيراد auth بشكل ديناميكي لتجنب مشاكل SSR
  const { auth } = await import('@/lib/firebase/config');
  const { onAuthStateChanged } = await import('firebase/auth');
  
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log('🔍 === Account Type Debug Info ===');
      const debugInfo = await debugAccountType(user.uid, user.email || '');
      console.table(debugInfo);
      console.log('📋 Recommended Action:', debugInfo.recommendedAction);
      console.log('=================================');
      
      // إضافة للـ window للوصول من console
      (window as any).accountDebugInfo = debugInfo;
      console.log('💡 Access debug info via: window.accountDebugInfo');
    }
  });
}

// تفعيل التشخيص في بيئة التطوير
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugAccountType = debugAccountType;
  (window as any).debugCurrentUser = debugCurrentUser;
  
  console.log('🛠️ Account debugging tools available:');
  console.log('   window.debugAccountType(uid, email)');
  console.log('   window.debugCurrentUser()');
} 
