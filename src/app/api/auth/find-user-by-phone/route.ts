import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 find-user-by-phone API called');
    
    const body = await request.json();
    console.log('🔍 Request body:', body);
    
    const { phone } = body;
    
    if (!phone) {
      console.log('❌ No phone provided in request');
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف مطلوب' },
        { status: 400 }
      );
    }

    console.log('🔍 Searching for user with phone:', phone);
    
    // التحقق من تهيئة Firebase Admin
    try {
      const { initializeFirebaseAdmin, getAdminDb } = await import('@/lib/firebase/admin');
      
      // تهيئة Firebase Admin
      initializeFirebaseAdmin();
      const db = getAdminDb();
      console.log('✅ Firestore instance created successfully');
      
      // البحث في جميع المجموعات الممكنة
      const collections = ['users', 'clubs', 'players', 'academies', 'agents', 'trainers', 'admins', 'marketers', 'parents'];
      console.log('🔍 Searching in collections:', collections);
      
      // تجربة تنسيقات مختلفة للرقم
      const phoneFormats = [
        phone, // كما هو
        phone.replace(/^\+/, ''), // بدون +
        phone.startsWith('+') ? phone : `+${phone}`, // مع +
        phone.replace(/\D/g, ''), // أرقام فقط
        `+${phone.replace(/\D/g, '')}` // + مع أرقام فقط
      ];
      
      console.log('🔍 Phone formats to try:', phoneFormats);
      
      for (const collectionName of collections) {
        console.log(`🔍 Searching in collection: ${collectionName}`);
        
        for (const phoneFormat of phoneFormats) {
          console.log(`🔍 Trying phone format: ${phoneFormat} in ${collectionName}`);
          
          const collectionRef = db.collection(collectionName);
          const query = collectionRef.where('phone', '==', phoneFormat);
          const snapshot = await query.get();
          
          console.log(`📊 Query result in ${collectionName} with ${phoneFormat} - empty:`, snapshot.empty, 'size:', snapshot.size);
          
          if (!snapshot.empty) {
            const userData = snapshot.docs[0].data();
            console.log('✅ Found user with phone:', {
              phone: phone,
              foundPhone: userData.phone,
              collection: collectionName,
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
          }
        }
      }
      
      // إذا لم يتم العثور على المستخدم في أي مجموعة
      console.log('❌ No user found with phone:', phone, 'in any collection');
      console.log('❌ Tried all phone formats:', phoneFormats);
      console.log('❌ Searched in all collections:', collections);
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على مستخدم بهذا الرقم' },
        { status: 404 }
      );
      
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