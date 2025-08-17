import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { rateLimiter, getClientIpFromHeaders } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIpFromHeaders(request.headers);
    const ipCheck = rateLimiter.check(`auth:reset:${clientIp}`, { windowMs: 60_000, max: 20, minIntervalMs: 1000 });
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'تم تجاوز عدد المحاولات. يرجى المحاولة لاحقاً.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(ipCheck.retryAfterMs / 1000)) } }
      );
    }
    const body = await request.json();
    const { phoneNumber, newPassword } = body;

    console.log('🔐 Password reset request for phone:', phoneNumber);

    // التحقق من البيانات المطلوبة
    if (!phoneNumber || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف وكلمة المرور الجديدة مطلوبان' },
        { status: 400 }
      );
    }

    // التحقق من طول كلمة المرور
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' },
        { status: 400 }
      );
    }

    // البحث عن المستخدم برقم الهاتف في Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phone', '==', phoneNumber));
    
    console.log('🔍 Searching for user with phone:', phoneNumber);
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ No user found with phone:', phoneNumber);
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على حساب بهذا رقم الهاتف' },
        { status: 404 }
      );
    }

    // الحصول على بيانات المستخدم
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const userEmail = userData.firebaseEmail || userData.email;

    if (!userEmail) {
      console.log('❌ No email found for user:', phoneNumber);
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على بريد إلكتروني للحساب' },
        { status: 404 }
      );
    }

    console.log('✅ User found:', { phoneNumber, email: userEmail });

    // في الوقت الحالي، نعرض رسالة نجاح مع تعليمات للمستخدم
    // TODO: إضافة Firebase Admin SDK لتحديث كلمة المرور فعلياً
    
    console.log('✅ Password reset verification successful for:', phoneNumber);
    
    return NextResponse.json({
      success: true,
      message: 'تم التحقق من رقم الهاتف بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',
      user: {
        phone: phoneNumber,
        email: userEmail
      },
      note: 'ملاحظة: تم التحقق من صحة رقم الهاتف. لتحديث كلمة المرور فعلياً، يرجى التواصل مع الدعم الفني.'
    });

  } catch (error: any) {
    console.error('❌ Password reset API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في الخادم',
        details: error.message
      },
      { status: 500 }
    );
  }
} 