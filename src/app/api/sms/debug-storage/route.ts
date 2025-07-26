import { NextRequest, NextResponse } from 'next/server';
import { getOTPStatus, getOTP, getOTPBySource } from '../otp-storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    
    console.log('🔍 Debug storage request for phone:', phone);
    
    // فحص حالة التخزين العامة
    getOTPStatus();
    
    if (phone) {
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      
      // البحث في كلا النوعين
      const whatsappOTP = getOTPBySource(formattedPhone, 'whatsapp');
      const smsOTP = getOTPBySource(formattedPhone, 'sms');
      const generalOTP = getOTP(formattedPhone);
      
      return NextResponse.json({
        success: true,
        phone: formattedPhone,
        whatsappOTP: whatsappOTP ? {
          otp: whatsappOTP.otp,
          source: whatsappOTP.source,
          timestamp: whatsappOTP.timestamp,
          attempts: whatsappOTP.attempts,
          expired: whatsappOTP.expired
        } : null,
        smsOTP: smsOTP ? {
          otp: smsOTP.otp,
          source: smsOTP.source,
          timestamp: smsOTP.timestamp,
          attempts: smsOTP.attempts,
          expired: smsOTP.expired
        } : null,
        generalOTP: generalOTP ? {
          otp: generalOTP.otp,
          source: generalOTP.source,
          timestamp: generalOTP.timestamp,
          attempts: generalOTP.attempts,
          expired: generalOTP.expired
        } : null
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Debug endpoint - check console for storage status'
    });
    
  } catch (error) {
    console.error('❌ Error in debug storage:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
} 