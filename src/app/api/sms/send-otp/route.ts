import { NextRequest, NextResponse } from 'next/server';
import beonSMSService from '@/lib/beon/sms-service';
import { storeOTP, getOTPStatus, getOTP } from '../otp-storage';
import { rateLimiter, getClientIpFromHeaders } from '@/lib/security/rate-limit';

// تخزين مؤقت للطلبات لمنع الإرسال المتكرر
const requestCache = new Map<string, { timestamp: number; count: number; lastRequest: number }>();
const CACHE_DURATION = 60000; // دقيقة واحدة
const MAX_REQUESTS_PER_MINUTE = 3;
const MIN_INTERVAL_BETWEEN_REQUESTS = 5000; // 5 ثوانٍ بين الطلبات

export async function POST(request: NextRequest) {
  try {
    // Global rate limit per IP + per phone
    const clientIp = getClientIpFromHeaders(request.headers);
    const ipCheck = rateLimiter.check(`sms:send:${clientIp}`, { windowMs: 60_000, max: 10, minIntervalMs: 1000 });
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'تم تجاوز عدد المحاولات. يرجى المحاولة لاحقاً.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(ipCheck.retryAfterMs / 1000)) } }
      );
    }
    const body = await request.json();
    const { phoneNumber, name, useTemplate = false, templateId = 133 } = body;

    console.log('📱 SMS OTP Request:', { phoneNumber, name, useTemplate, templateId });

    // التحقق من البيانات المطلوبة
    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف مطلوب' },
        { status: 400 }
      );
    }

    // تنسيق رقم الهاتف
    const formattedPhone = beonSMSService.formatPhoneNumber(phoneNumber);
    console.log('📱 Formatted phone:', formattedPhone);
    
    // التحقق من صحة رقم الهاتف
    if (!beonSMSService.validatePhoneNumber(formattedPhone)) {
      console.log('❌ Invalid phone number:', formattedPhone);
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف غير صحيح' },
        { status: 400 }
      );
    }

    // التحقق من وجود OTP مخزن مسبقاً
    const existingOTP = await getOTP(formattedPhone);
    if (existingOTP && !existingOTP.expired) {
      console.log('📱 Found existing valid OTP for:', formattedPhone, 'OTP:', existingOTP.otp);
      console.log('📱 OTP age:', Date.now() - existingOTP.timestamp, 'ms');
      console.log('📱 Returning existing OTP without sending new one');
      
      return NextResponse.json({
        success: true,
        message: 'تم إرسال رمز التحقق بنجاح',
        phoneNumber: formattedPhone,
        existingOTP: true,
        otp: existingOTP.otp
      });
    }

    // التحقق من وجود OTP مخزن مسبقاً بتنسيق مختلف
    const phoneWithoutPlus = formattedPhone.replace('+', '');
    const existingOTPWithoutPlus = await getOTP(phoneWithoutPlus);
    if (existingOTPWithoutPlus && !existingOTPWithoutPlus.expired) {
      console.log('📱 Found existing valid OTP for:', phoneWithoutPlus, 'OTP:', existingOTPWithoutPlus.otp);
      console.log('📱 OTP age:', Date.now() - existingOTPWithoutPlus.timestamp, 'ms');
      console.log('📱 Returning existing OTP without sending new one');
      
      return NextResponse.json({
        success: true,
        message: 'تم إرسال رمز التحقق بنجاح',
        phoneNumber: formattedPhone,
        existingOTP: true,
        otp: existingOTPWithoutPlus.otp
      });
    }

    // التحقق من وجود OTP مخزن مسبقاً بتنسيق مختلف آخر
    const phoneWithPlus = '+' + phoneWithoutPlus;
    const existingOTPWithPlus = await getOTP(phoneWithPlus);
    if (existingOTPWithPlus && !existingOTPWithPlus.expired) {
      console.log('📱 Found existing valid OTP for:', phoneWithPlus, 'OTP:', existingOTPWithPlus.otp);
      console.log('📱 OTP age:', Date.now() - existingOTPWithPlus.timestamp, 'ms');
      console.log('📱 Returning existing OTP without sending new one');
      
      return NextResponse.json({
        success: true,
        message: 'تم إرسال رمز التحقق بنجاح',
        phoneNumber: formattedPhone,
        existingOTP: true,
        otp: existingOTPWithPlus.otp
      });
    }

    // التحقق من وجود OTP مخزن مسبقاً بالتنسيق الأصلي
    const originalPhone = phoneNumber;
    const existingOTPOriginal = await getOTP(originalPhone);
    if (existingOTPOriginal && !existingOTPOriginal.expired) {
      console.log('📱 Found existing valid OTP for:', originalPhone, 'OTP:', existingOTPOriginal.otp);
      console.log('📱 OTP age:', Date.now() - existingOTPOriginal.timestamp, 'ms');
      console.log('📱 Returning existing OTP without sending new one');
      
      return NextResponse.json({
        success: true,
        message: 'تم إرسال رمز التحقق بنجاح',
        phoneNumber: formattedPhone,
        existingOTP: true,
        otp: existingOTPOriginal.otp
      });
    }

    // حماية ضد الإرسال المتكرر
    const perPhoneCheck = rateLimiter.check(`sms:phone:${formattedPhone}`, { windowMs: 60_000, max: 3, minIntervalMs: 5_000 });
    if (!perPhoneCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'تم تجاوز الحد الأقصى للطلبات. يرجى الانتظار دقيقة واحدة قبل المحاولة مرة أخرى.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(perPhoneCheck.retryAfterMs / 1000)) } }
      );
    }

    const now = Date.now();
    const cacheKey = formattedPhone;
    const cachedRequest = requestCache.get(cacheKey);
    
    if (cachedRequest) {
      const timeDiff = now - cachedRequest.timestamp;
      const lastRequestDiff = now - cachedRequest.lastRequest;
      
      // التحقق من الفاصل الزمني الأدنى بين الطلبات
      if (lastRequestDiff < MIN_INTERVAL_BETWEEN_REQUESTS) {
        console.log('🛑 Too frequent requests for:', formattedPhone);
        return NextResponse.json(
          { 
            success: false, 
            error: 'يرجى الانتظار 5 ثوانٍ قبل إرسال طلب جديد' 
          },
          { status: 429 }
        );
      }
      
      // إذا كان الطلب في آخر دقيقة
      if (timeDiff < CACHE_DURATION) {
        if (cachedRequest.count >= MAX_REQUESTS_PER_MINUTE) {
          console.log('🛑 Rate limit exceeded for:', formattedPhone);
          return NextResponse.json(
            { 
              success: false, 
              error: 'تم تجاوز الحد الأقصى للطلبات. يرجى الانتظار دقيقة واحدة قبل المحاولة مرة أخرى.' 
            },
            { status: 429 }
          );
        }
        
        // زيادة العداد
        cachedRequest.count++;
        cachedRequest.lastRequest = now;
        requestCache.set(cacheKey, cachedRequest);
      } else {
        // إعادة تعيين العداد بعد انتهاء المدة
        requestCache.set(cacheKey, { timestamp: now, count: 1, lastRequest: now });
      }
    } else {
      // أول طلب لهذا الرقم
      requestCache.set(cacheKey, { timestamp: now, count: 1, lastRequest: now });
    }

    // تنظيف الكاش القديم
    for (const [key, value] of requestCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        requestCache.delete(key);
      }
    }

    console.log('📱 Rate limit check passed for:', formattedPhone);

    // استخدام API الجديد لإرسال OTP
    console.log('📱 Attempting to send OTP to:', formattedPhone);
    let smsResult = await beonSMSService.sendOTPNew(formattedPhone, name, 6, 'ar');

    // إذا فشل API الجديد، جرب الطريقة البديلة
    if (!smsResult.success) {
      console.log('📱 New API failed, trying alternative method...');
      const otp = beonSMSService.generateOTP();
      console.log('📱 Generated OTP for fallback:', otp);
      smsResult = await beonSMSService.sendOTPPlain(formattedPhone, otp, name);
      console.log('📱 Fallback method result:', smsResult);
    }

    if (smsResult.success) {
      console.log('📱 OTP sent successfully to:', formattedPhone);
      console.log('📱 OTP length:', smsResult.otp?.length || 'unknown');
      
      // تخزين OTP للتحقق لاحقاً
      if (smsResult.otp) {
              // التحقق من وجود OTP مخزن مسبقاً قبل التخزين
        const existingOTP = await getOTP(formattedPhone);

              if (existingOTP && !existingOTP.expired) {
                console.log('📱 Found existing OTP, not overwriting:', formattedPhone);
                console.log('📱 SMS OTP would be:', smsResult.otp);
                console.log('📱 Keeping existing OTP to prevent conflicts');

                // إرجاع الـ OTP الموجود بدلاً من إرسال واحد جديد
                return NextResponse.json({
                  success: true,
                  message: 'تم إرسال رمز التحقق بنجاح',
                  phoneNumber: formattedPhone,
                  existingOTP: true,
                  otp: existingOTP.otp,
                  source: existingOTP.source
                });
              } else {
          await storeOTP(formattedPhone, smsResult.otp, 'sms');
                console.log('💾 SMS OTP stored successfully for verification');
              }
        await getOTPStatus();
      } else {
        console.log('⚠️ No OTP received from SMS service');
      }

      return NextResponse.json({
        success: true,
        message: 'تم إرسال رمز التحقق بنجاح',
        phoneNumber: formattedPhone,
        otp: smsResult.otp
      });
    } else {
      console.error('❌ Failed to send OTP:', smsResult.error);
      return NextResponse.json(
        { 
          success: false, 
          error: smsResult.error || 'فشل في إرسال رمز التحقق' 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Error in SMS OTP API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطأ في الخادم. يرجى المحاولة مرة أخرى.' 
      },
      { status: 500 }
    );
  }
}

// التحقق من صحة رقم الهاتف
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف مطلوب' },
        { status: 400 }
      );
    }

    const formattedPhone = beonSMSService.formatPhoneNumber(phoneNumber);
    const isValid = beonSMSService.validatePhoneNumber(formattedPhone);

    return NextResponse.json({
      success: true,
      isValid,
      formattedPhone: isValid ? formattedPhone : null,
      error: isValid ? null : 'رقم الهاتف غير صحيح'
    });

  } catch (error: any) {
    console.error('❌ Phone validation error:', error);
    console.error('❌ Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في التحقق من رقم الهاتف',
        details: error.message
      },
      { status: 500 }
    );
  }
} 