import { NextRequest, NextResponse } from 'next/server';
import { getOTP, clearOTP, incrementAttempts } from '../otp-storage';
import { rateLimiter, getClientIpFromHeaders } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 OTP verification request received');
    
    // التحقق من معدل الطلبات حسب IP
    const clientIp = getClientIpFromHeaders(request.headers);
    const ipCheck = rateLimiter.check(`sms:verify:${clientIp}`, { 
      windowMs: 60_000, // نافذة دقيقة واحدة
      max: 60, // 60 محاولة كحد أقصى
      minIntervalMs: 200 // 200ms بين المحاولات
    });
    
    if (!ipCheck.allowed) {
      console.log('❌ IP rate limit exceeded:', clientIp);
      return NextResponse.json(
        { success: false, error: 'تم تجاوز عدد المحاولات. يرجى المحاولة لاحقاً.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(ipCheck.retryAfterMs / 1000)) } }
      );
    }
    
    // استخراج البيانات من الطلب
    const body = await request.json();
    const { phoneNumber, otpCode, otp } = body;
    const code = otpCode || otp;
    
    console.log('📱 Verifying OTP for:', phoneNumber);
    
    // التحقق من وجود البيانات المطلوبة
    if (!phoneNumber || !code) {
      console.log('❌ Missing required data');
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف ورمز التحقق مطلوبان' },
        { status: 400 }
      );
    }
    
    // جلب OTP من Firestore
    const storedOTP = await getOTP(phoneNumber);
    
    // التحقق من وجود OTP
    if (!storedOTP) {
      console.log('❌ No OTP found for:', phoneNumber);
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على رمز تحقق صالح لهذا الرقم' },
        { status: 404 }
      );
    }
    
    // التحقق من صلاحية OTP
    if (storedOTP.expired) {
      console.log('❌ OTP expired for:', phoneNumber);
      await clearOTP(phoneNumber); // مسح OTP منتهي الصلاحية
      return NextResponse.json(
        { success: false, error: 'رمز التحقق منتهي الصلاحية' },
        { status: 400 }
      );
    }
    
    // التحقق من عدد المحاولات
    if (storedOTP.attempts >= 3) {
      console.log('❌ Max attempts exceeded for:', phoneNumber);
      await clearOTP(phoneNumber); // مسح OTP بعد تجاوز المحاولات
      return NextResponse.json(
        { success: false, error: 'تم تجاوز الحد الأقصى من المحاولات' },
        { status: 400 }
      );
    }
    
    // تحقق من الرمز
    console.log('🔍 Comparing OTP codes');
    if (storedOTP.otp === code) {
      console.log('✅ OTP verified successfully for:', phoneNumber);
      await clearOTP(phoneNumber);
      return NextResponse.json({
        success: true,
        message: 'تم التحقق من الرمز بنجاح',
        phoneNumber,
        source: storedOTP.source
      });
    } else {
      console.log('❌ OTP mismatch for:', phoneNumber);
      
      // التحقق من معدل المحاولات لكل رقم هاتف
      const perPhoneCheck = rateLimiter.check(`sms:verify-phone:${phoneNumber}`, { 
        windowMs: 300_000, // نافذة 5 دقائق
        max: 10, // 10 محاولات كحد أقصى
        minIntervalMs: 1000 // ثانية واحدة بين المحاولات
      });
      
      if (!perPhoneCheck.allowed) {
        console.log('❌ Phone rate limit exceeded:', phoneNumber);
        return NextResponse.json(
          { success: false, error: 'تم تجاوز محاولات التحقق. يرجى المحاولة لاحقاً.' },
          { status: 429, headers: { 'Retry-After': String(Math.ceil(perPhoneCheck.retryAfterMs / 1000)) } }
        );
      }
      
      // زيادة عدد المحاولات
      await incrementAttempts(phoneNumber);
      
      // سجل تفاصيل عدم التطابق (مع إخفاء الرموز الكاملة)
      console.log('❌ OTP mismatch details:', { 
        expected: `${storedOTP.otp.substring(0, 2)}***${storedOTP.otp.substring(5)}`,
        received: `${code.substring(0, 2)}***${code.substring(5)}`
      });
      
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