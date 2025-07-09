import { NextRequest, NextResponse } from 'next/server';
import { sendBeOnWhatsAppOTP } from '@/lib/whatsapp/beon-whatsapp-service';

// تخزين مؤقت للطلبات لمنع الإرسال المتكرر
const requestCache = new Map<string, { timestamp: number; count: number; lastRequest: number }>();
const CACHE_DURATION = 60000; // دقيقة واحدة
const MAX_REQUESTS_PER_MINUTE = 3;
const MIN_INTERVAL_BETWEEN_REQUESTS = 5000; // 5 ثوانٍ بين الطلبات

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp, name } = body;

    console.log('📱 BeOn WhatsApp OTP Request:', { phone, name });

    if (!phone || !otp || !name) {
      return NextResponse.json(
        { success: false, error: 'جميع البيانات مطلوبة (phone, otp, name)' },
        { status: 400 }
      );
    }

    // حماية ضد الإرسال المتكرر
    const now = Date.now();
    const cacheKey = phone;
    const cachedRequest = requestCache.get(cacheKey);
    
    if (cachedRequest) {
      const timeDiff = now - cachedRequest.timestamp;
      const lastRequestDiff = now - cachedRequest.lastRequest;
      
      // التحقق من الفاصل الزمني الأدنى بين الطلبات
      if (lastRequestDiff < MIN_INTERVAL_BETWEEN_REQUESTS) {
        console.log('🛑 Too frequent requests for:', phone, 'last request was', lastRequestDiff, 'ms ago');
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
          console.log('🛑 Rate limit exceeded for:', phone);
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

    console.log('📱 Rate limit check passed for:', phone);

    // إرسال OTP عبر BeOn WhatsApp
    const beonResult = await sendBeOnWhatsAppOTP(phone, otp, name);

    if (beonResult.success) {
      console.log('📱 BeOn WhatsApp OTP sent successfully to:', phone);
      
      return NextResponse.json({
        success: true,
        message: beonResult.message || 'تم إرسال رمز التحقق عبر WhatsApp بنجاح',
        phoneNumber: phone,
        otp: otp, // نرسل OTP في الاستجابة للاختبار فقط
        link: beonResult.link,
        fallback: beonResult.fallback
      });
    } else {
      console.error('❌ Failed to send BeOn WhatsApp OTP:', beonResult.error);
      
      return NextResponse.json(
        { 
          success: false, 
          error: beonResult.error || 'فشل في إرسال رمز التحقق عبر WhatsApp' 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ BeOn WhatsApp API error:', error);
    
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