import { NextRequest, NextResponse } from 'next/server';
import { getOTP, clearOTP, incrementAttempts } from '../otp-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, otpCode, otp } = body;
    const code = otpCode || otp;

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف ورمز التحقق مطلوبان' },
        { status: 400 }
      );
    }

    // جلب OTP من Firestore
    const storedOTP = await getOTP(phoneNumber);

    if (!storedOTP) {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على رمز تحقق صالح لهذا الرقم' },
        { status: 404 }
      );
    }

    if (storedOTP.expired) {
      return NextResponse.json(
        { success: false, error: 'رمز التحقق منتهي الصلاحية' },
        { status: 400 }
      );
    }

    // تحقق من الرمز
    if (storedOTP.otp === code) {
      await clearOTP(phoneNumber);
      return NextResponse.json({
        success: true,
        message: 'تم التحقق من الرمز بنجاح',
        phoneNumber,
        source: storedOTP.source
      });
    } else {
      await incrementAttempts(phoneNumber);
      console.log('❌ OTP mismatch:', { expected: storedOTP.otp, received: code });
      return NextResponse.json(
        { success: false, error: 'رمز التحقق غير صحيح' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('❌ Error in OTP verification:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في الخادم. يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    );
  }
}

 