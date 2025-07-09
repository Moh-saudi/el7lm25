import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import '@/lib/firebase/admin'; // فقط لتشغيل التهيئة

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    
    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف مطلوب' },
        { status: 400 }
      );
    }

    console.log('🔍 Searching for user with phone:', phone);
    
    // التحقق من تهيئة Firebase Admin
    try {
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
        const userData = snapshot.docs[0].data();
        console.log('✅ Found user with phone:', {
          phone: phone,
          foundPhone: userData.phone,
          userId: snapshot.docs[0].id,
          accountType: userData.accountType,
          firebaseEmail: userData.firebaseEmail || userData.email
        });
        
        return NextResponse.json({
          success: true,
          user: {
            uid: snapshot.docs[0].id,
            phone: userData.phone,
            email: userData.firebaseEmail || userData.email,
            accountType: userData.accountType,
            full_name: userData.full_name || userData.name
          }
        });
      } else {
        console.log('❌ No user found with phone:', phone);
        return NextResponse.json(
          { success: false, error: 'لم يتم العثور على مستخدم بهذا الرقم' },
          { status: 404 }
        );
      }
      
    } catch (firestoreError: any) {
      console.error('❌ Firestore error:', firestoreError);
      
      // معالجة أخطاء محددة
      if (firestoreError.code === 'permission-denied') {
        return NextResponse.json(
          { 
            success: false,
            error: 'خطأ في الصلاحيات - تحقق من قواعد Firestore',
            details: firestoreError.message
          },
          { status: 403 }
        );
      }
      
      if (firestoreError.code === 'unavailable' || firestoreError.message.includes('network')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'خطأ في الاتصال - تحقق من إعدادات Firebase',
            details: firestoreError.message
          },
          { status: 503 }
        );
      }
      
      throw firestoreError; // إعادة رمي الخطأ للمعالجة العامة
    }
    
  } catch (error: any) {
    console.error('❌ Error finding user by phone:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'فشل في البحث عن المستخدم',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
} 