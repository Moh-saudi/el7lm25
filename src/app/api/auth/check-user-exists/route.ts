import { NextRequest, NextResponse } from 'next/server';

// تجنب Firebase Admin أثناء البناء
export async function POST(request: NextRequest) {
  // إذا كنا في وضع البناء، ارجع استجابة مؤقتة
  if (process.env.NODE_ENV === 'production' && !process.env.FIREBASE_PRIVATE_KEY) {
    return NextResponse.json(
      { 
        message: 'Service temporarily unavailable during deployment',
        emailExists: false,
        phoneExists: false 
      },
      { status: 503 }
    );
  }

  const { email, phone } = await request.json();
  
  try {
    let emailExists = false;
    let phoneExists = false;
    
    console.log('🔍 Checking user exists:', { email, phone });
    
    // تهيئة Firebase فقط عند الحاجة
    if (process.env.FIREBASE_PRIVATE_KEY) {
      try {
        const { initializeFirebaseAdmin, getAdminDb } = await import('@/lib/firebase/admin');
        initializeFirebaseAdmin();
        
        // استخدام Firebase Admin للوصول إلى Firestore
        const db = getAdminDb();
        console.log('✅ Firestore instance created successfully');
        
        // البحث عن المستخدم بالبريد الإلكتروني
        if (email) {
          const emailQuery = await db.collection('users').where('email', '==', email).limit(1).get();
          emailExists = !emailQuery.empty;
          console.log('📧 Email check result:', emailExists);
        }
        
        // البحث عن المستخدم برقم الهاتف
        if (phone) {
          const phoneQuery = await db.collection('users').where('phone', '==', phone).limit(1).get();
          phoneExists = !phoneQuery.empty;
          console.log('📱 Phone check result:', phoneExists);
        }
      } catch (firebaseError) {
        console.error('❌ Firebase error:', firebaseError);
        return NextResponse.json(
          { 
            error: 'Authentication service unavailable',
            emailExists: false,
            phoneExists: false 
          },
          { status: 503 }
        );
      }
    }
    
    console.log('✅ User existence check completed:', { emailExists, phoneExists });
    
    return NextResponse.json({
      emailExists,
      phoneExists,
      message: 'User existence check completed successfully'
    });
    
  } catch (error) {
    console.error('❌ Error checking user existence:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        emailExists: false,
        phoneExists: false 
      },
      { status: 500 }
    );
  }
} 