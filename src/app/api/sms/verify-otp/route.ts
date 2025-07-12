import { NextRequest, NextResponse } from 'next/server';
import { getOTP, clearOTP, getOTPStatus, incrementAttempts } from '../otp-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // دعم otpCode أو otp
    const { phoneNumber, otpCode, otp } = body;
    const code = otpCode || otp;

    console.log('🔍 OTP Verification Request:', { phoneNumber, otpCode, otp });

    // التحقق من البيانات المطلوبة
    if (!phoneNumber || !code) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف ورمز التحقق مطلوبان' },
        { status: 400 }
      );
    }

    // تنسيق رقم الهاتف
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    console.log('🔍 Looking for OTP for phone:', formattedPhone);

    // فحص حالة التخزين قبل التحقق
    getOTPStatus();

    // الحصول على OTP المخزن
    const storedOTP = getOTP(formattedPhone);
    console.log('🔍 getOTP called for:', formattedPhone, 'Found:', !!storedOTP);

    if (!storedOTP) {
      console.log('❌ No OTP found for phone:', formattedPhone);
      getOTPStatus(); // فحص حالة التخزين عند عدم العثور على OTP
      return NextResponse.json(
        { 
          success: false, 
          error: 'رمز التحقق غير صحيح أو منتهي الصلاحية' 
        },
        { status: 404 }
      );
    }

    // التحقق من عدد المحاولات
    if (storedOTP.attempts >= 5) {
      console.log('❌ Too many attempts for phone:', formattedPhone, 'Attempts:', storedOTP.attempts);
      clearOTP(formattedPhone);
      return NextResponse.json(
        { 
          success: false, 
          error: 'تم تجاوز الحد الأقصى للمحاولات. يرجى طلب رمز تحقق جديد.' 
        },
        { status: 429 }
      );
    }

    // زيادة عدد المحاولات
    incrementAttempts(formattedPhone);

    // التحقق من تطابق OTP
    if (storedOTP.otp === code) {
      console.log('✅ OTP verified successfully for:', formattedPhone);
      
      // مسح OTP بعد التحقق الناجح
      clearOTP(formattedPhone);
      console.log('🗑️ OTP cleared for phone:', formattedPhone);
      
      return NextResponse.json({
        success: true,
        message: 'تم التحقق من رمز التحقق بنجاح',
        phoneNumber: formattedPhone
      });
    } else {
      console.log('❌ OTP mismatch for phone:', formattedPhone);
      console.log('Expected:', storedOTP.otp, 'Received:', code);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'رمز التحقق غير صحيح' 
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ Error in OTP verification:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطأ في الخادم. يرجى المحاولة مرة أخرى.' 
      },
      { status: 500 }
    );
  }
}

 