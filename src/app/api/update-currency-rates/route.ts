import { NextRequest, NextResponse } from 'next/server';
import { forceUpdateRates, getLastUpdateTime } from '@/lib/currency-converter';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 بدء تحديث أسعار الصرف...');
    
    // فرض تحديث الأسعار
    const success = await forceUpdateRates();
    
    if (success) {
      const lastUpdate = getLastUpdateTime();
      console.log('✅ تم تحديث أسعار الصرف بنجاح');
      
      return NextResponse.json({
        success: true,
        message: 'تم تحديث أسعار الصرف بنجاح',
        lastUpdated: lastUpdate?.toISOString(),
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('⚠️ لم يتم تحديث أسعار الصرف - استخدام الأسعار الافتراضية');
      
      return NextResponse.json({
        success: false,
        message: 'فشل في تحديث أسعار الصرف - تم استخدام الأسعار الافتراضية',
        lastUpdated: getLastUpdateTime()?.toISOString() || null,
        timestamp: new Date().toISOString()
      }, { status: 200 });
    }
  } catch (error) {
    console.error('❌ خطأ في تحديث أسعار الصرف:', error);
    
    return NextResponse.json({
      success: false,
      message: 'حدث خطأ أثناء تحديث أسعار الصرف',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const lastUpdate = getLastUpdateTime();
    
    return NextResponse.json({
      lastUpdated: lastUpdate?.toISOString() || null,
      cacheAge: lastUpdate ? Date.now() - lastUpdate.getTime() : null,
      nextUpdate: lastUpdate ? new Date(lastUpdate.getTime() + 3600000).toISOString() : null, // بعد ساعة
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      error: 'فشل في الحصول على معلومات التحديث',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 