import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // التحقق من متغيرات البيئة
    const businessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const businessPhoneId = process.env.WHATSAPP_PHONE_ID;
    const greenApiToken = process.env.GREEN_API_TOKEN;
    const greenApiInstance = process.env.GREEN_API_INSTANCE;

    const config = {
      business: {
        token: businessToken ? '✅ Set' : '❌ Missing',
        phoneId: businessPhoneId ? '✅ Set' : '❌ Missing',
        valid: !!(businessToken && businessPhoneId)
      },
      green: {
        token: greenApiToken ? '✅ Set' : '❌ Missing',
        instance: greenApiInstance ? '✅ Set' : '❌ Missing',
        valid: !!(greenApiToken && greenApiInstance)
      }
    };

    // تحديد النوع الافتراضي
    const defaultType = config.business.valid ? 'business' : config.green.valid ? 'green' : 'none';

    const result = {
      success: config.business.valid || config.green.valid,
      defaultType,
      config,
      message: config.business.valid || config.green.valid 
        ? 'WhatsApp configuration is valid' 
        : 'WhatsApp configuration is missing or invalid',
      recommendations: []
    };

    // إضافة توصيات
    if (!config.business.valid && !config.green.valid) {
      result.recommendations.push('Set up either WhatsApp Business API or Green API configuration');
    }

    if (!config.business.valid && config.green.valid) {
      result.recommendations.push('WhatsApp Business API is not configured, using Green API');
    }

    if (config.business.valid && !config.green.valid) {
      result.recommendations.push('Green API is not configured, using WhatsApp Business API');
    }

    console.log('🔧 WhatsApp config test result:', result);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ WhatsApp config test error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في اختبار التكوين',
        details: error.message
      },
      { status: 500 }
    );
  }
} 