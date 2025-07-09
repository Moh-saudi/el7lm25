import { NextRequest, NextResponse } from 'next/server';
import BeOnWhatsAppService from '@/lib/whatsapp/beon-whatsapp-service';

const beonService = new BeOnWhatsAppService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // استخراج البيانات من query parameters حسب تنسيق BeOn
    const otp = searchParams.get('otp');
    const reference = searchParams.get('reference');
    const status = searchParams.get('status');
    const clientPhone = searchParams.get('clientPhone');
    const clientName = searchParams.get('clientName');

    console.log('📞 BeOn callback received:', {
      otp,
      reference,
      status,
      clientPhone,
      clientName
    });

    if (!otp || !reference || !status || !clientPhone) {
      console.error('❌ Missing required callback parameters');
      return NextResponse.json(
        { error: 'Missing required callback parameters' },
        { status: 400 }
      );
    }

    // معالجة البيانات
    const callbackData = {
      otp,
      reference,
      status,
      clientPhone,
      clientName: clientName || 'Unknown'
    };

    console.log('✅ Processing BeOn callback data:', callbackData);

    // هنا يمكنك إضافة منطق إضافي مثل:
    // - تحديث حالة المستخدم في قاعدة البيانات
    // - إرسال إشعارات
    // - تسجيل النشاط

    const isValid = beonService.handleCallback(callbackData);

    if (isValid) {
      console.log('✅ Callback processed successfully');
      return NextResponse.json({
        success: true,
        message: 'Callback processed successfully',
        data: callbackData
      });
    } else {
      console.error('❌ Invalid callback data');
      return NextResponse.json(
        { error: 'Invalid callback data' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('❌ BeOn callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📞 BeOn POST callback received:', body);

    const { otp, reference, status, clientPhone, clientName } = body;

    if (!otp || !reference || !status || !clientPhone) {
      return NextResponse.json(
        { error: 'Missing required callback parameters' },
        { status: 400 }
      );
    }

    // معالجة البيانات
    const callbackData = {
      otp,
      reference,
      status,
      clientPhone,
      clientName: clientName || 'Unknown'
    };

    const isValid = beonService.handleCallback(callbackData);

    if (isValid) {
      return NextResponse.json({
        success: true,
        message: 'Callback processed successfully',
        data: callbackData
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid callback data' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('❌ BeOn POST callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 