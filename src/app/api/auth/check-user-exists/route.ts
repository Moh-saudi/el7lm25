import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import '@/lib/firebase/admin'; // فقط لتشغيل التهيئة

function normalizePhone(countryCode: string, phone: string) {
  let local = phone.replace(/^0+/, '');
  local = local.replace(/\D/g, '');
  return `${countryCode.replace(/\D/g, '')}${local}`;
}

export async function POST(request: NextRequest) {
  const { email, phone } = await request.json();
  try {
    let emailExists = false;
    let phoneExists = false;
    
    console.log('🔍 Checking user exists:', { email, phone });
    
    // Email validation disabled temporarily - focusing on phone-only registration
    // التحقق من البريد الإلكتروني في Firebase Auth
    // if (email) {
    //   try {
    //     await getAuth().getUserByEmail(email);
    //     emailExists = true;
    //     console.log('✅ Email exists in Firebase Auth');
    //   } catch (error: any) {
    //     if (error.code === 'auth/user-not-found') {
    //       console.log('❌ Email not found in Firebase Auth');
    //   } else {
    //       console.error('Error checking email in Firebase Auth:', error);
    //     }
    //   }
    // }
    
    // التحقق من رقم الهاتف في Firestore باستخدام Admin SDK
    if (phone) {
      try {
        console.log('📱 Checking phone number:', phone);
        console.log('🔧 Using Firebase Admin SDK for Firestore access');
        
        // استخدام Firebase Admin للوصول إلى Firestore
        const db = getFirestore();
        console.log('✅ Firestore instance created successfully');
        
        const usersRef = db.collection('users');
        console.log('✅ Users collection reference created');
        
        // البحث بالرقم كما هو (مع + أو بدون)
        console.log('🔍 Searching with original phone format:', phone);
        let query = usersRef.where('phone', '==', phone);
        let snapshot = await query.get();
        console.log('📊 Query result - empty:', snapshot.empty, 'size:', snapshot.size);
        
        if (snapshot.empty) {
          // إذا لم يجد، جرب بدون +
          const phoneWithoutPlus = phone.replace(/^\+/, '');
          console.log('🔍 Searching without plus:', phoneWithoutPlus);
          query = usersRef.where('phone', '==', phoneWithoutPlus);
          snapshot = await query.get();
          console.log('📊 Query result - empty:', snapshot.empty, 'size:', snapshot.size);
        }
        
        if (snapshot.empty) {
          // إذا لم يجد، جرب مع +
          const phoneWithPlus = phone.startsWith('+') ? phone : `+${phone}`;
          console.log('🔍 Searching with plus:', phoneWithPlus);
          query = usersRef.where('phone', '==', phoneWithPlus);
          snapshot = await query.get();
          console.log('📊 Query result - empty:', snapshot.empty, 'size:', snapshot.size);
        }
        
        if (!snapshot.empty) {
          phoneExists = true;
          const userData = snapshot.docs[0].data();
          console.log('✅ Phone exists in Firestore:', {
            phone: phone,
            foundPhone: userData.phone,
            userId: snapshot.docs[0].id,
            accountType: userData.accountType
          });
        } else {
          console.log('❌ Phone not found in Firestore:', phone);
        }
      } catch (error: any) {
        console.error('❌ Error checking phone in Firestore:');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error stack:', error.stack);
        
        // مع القواعد الجديدة، Admin SDK يجب أن يعمل بدون مشاكل
        // إذا كان هناك خطأ، نعتبر أن الرقم غير موجود
        console.log('🔒 Error accessing Firestore - treating as phone not found');
        console.log('💡 This might be due to:');
        console.log('   1. Firestore Rules not deployed');
        console.log('   2. Firebase Admin SDK not configured properly');
        console.log('   3. Environment variables missing');
        console.log('   4. Database connection issues');
        phoneExists = false;
      }
    }
    
    console.log('📊 Final result:', { emailExists, phoneExists });
    return NextResponse.json({ emailExists, phoneExists });
  } catch (error: any) {
    console.error('❌ Check user exists error:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json({ 
      error: 'فشل في التحقق من المستخدم',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
} 