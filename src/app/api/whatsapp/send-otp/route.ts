import { NextRequest, NextResponse } from 'next/server';
import whatsappService from '@/lib/whatsapp/whatsapp-service';

// تخزين مؤقت للطلبات لمنع الإرسال المتكرر
const requestCache = new Map<string, { timestamp: number; count: number; lastRequest: number }>();
const CACHE_DURATION = 60000; // دقيقة واحدة
const MAX_REQUESTS_PER_MINUTE = 3;
const MIN_INTERVAL_BETWEEN_REQUESTS = 5000; // 5 ثوانٍ بين الطلبات

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, name, serviceType = 'business' } = body;

    console.log('📱 WhatsApp OTP Request:', { phoneNumber, name, serviceType });

    // التحقق من البيانات المطلوبة
    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف مطلوب' },
        { status: 400 }
      );
    }

    // تنسيق رقم الهاتف
    const formattedPhone = whatsappService.formatPhoneNumber(phoneNumber);
    
    // التحقق من صحة رقم الهاتف
    if (!whatsappService.validatePhoneNumber(formattedPhone)) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف غير صحيح' },
        { status: 400 }
      );
    }

    // حماية ضد الإرسال المتكرر
    const now = Date.now();
    const cacheKey = formattedPhone;
    const cachedRequest = requestCache.get(cacheKey);
    
    if (cachedRequest) {
      const timeDiff = now - cachedRequest.timestamp;
      const lastRequestDiff = now - cachedRequest.lastRequest;
      
      // التحقق من الفاصل الزمني الأدنى بين الطلبات
      if (lastRequestDiff < MIN_INTERVAL_BETWEEN_REQUESTS) {
        console.log('🛑 Too frequent requests for:', formattedPhone, 'last request was', lastRequestDiff, 'ms ago');
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

    // إنشاء OTP جديد
    const otp = whatsappService.generateOTP();
    
    // إرسال OTP عبر WhatsApp
    const whatsappResult = await whatsappService.sendOTP(formattedPhone, otp, name, serviceType);

    if (whatsappResult.success) {
      console.log('📱 WhatsApp OTP sent successfully to:', formattedPhone);
      
      return NextResponse.json({
        success: true,
        message: 'تم إرسال رمز التحقق عبر WhatsApp بنجاح',
        phoneNumber: formattedPhone,
        // لا نرسل OTP في الاستجابة لأمان
        otpLength: otp.length
      });
    } else {
      console.error('❌ Failed to send WhatsApp OTP:', whatsappResult.error);
      
      return NextResponse.json(
        { 
          success: false, 
          error: whatsappResult.error || 'فشل في إرسال رمز التحقق عبر WhatsApp' 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ WhatsApp API error:', error);
    
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