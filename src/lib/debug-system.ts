// ملف تشخيص شامل للنظام - نسخة محسّنة
export function debugSystem() {
  // عرض رسالة مختصرة فقط في وضع التطوير
  if (process.env.NODE_ENV === 'development') {
    // فحص سريع للخدمات الأساسية
    const firebaseReady = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const devMode = process.env.NODE_ENV === 'development';
    
    console.log(`🔧 System Status: Firebase ${firebaseReady ? '✅' : '❌'} | Dev Mode ${devMode ? '✅' : '❌'} | Ready to go!`);
  }
}

// دالة لفحص الأخطاء الشائعة - نسخة محسّنة
export function checkCommonIssues() {
  // فحص صامت - يظهر الأخطاء فقط إذا وُجدت
  const issues = [];
  
  // فحص متغيرات Firebase
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    issues.push('❌ Firebase API Key missing');
  }
  
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    issues.push('❌ Firebase Project ID missing');
  }
  
  // فحص البيئة
  if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'production') {
    issues.push('⚠️ NODE_ENV not properly set');
  }
  
  // عرض النتيجة فقط إذا وُجدت مشاكل أو في وضع التطوير مع أخطاء
  if (issues.length > 0) {
    console.warn('⚠️ Issues found:', issues);
  } else if (process.env.NODE_ENV === 'development') {
    // رسالة مختصرة في وضع التطوير فقط
    console.log('✅ System check: All good');
  }
}

// دالة لفحص الأداء
export function checkPerformance() {
  console.log('⚡ فحص الأداء...');
  
  if (typeof performance !== 'undefined') {
    const perfData = {
      navigationStart: performance.timing?.navigationStart,
      loadEventEnd: performance.timing?.loadEventEnd,
      domContentLoaded: performance.timing?.domContentLoadedEventEnd
    };
    
    console.log('📊 بيانات الأداء:', perfData);
    return perfData;
  }
  
  console.log('⚠️ بيانات الأداء غير متاحة');
  return null;
}

// دالة فحص تكوين Geidea
export async function checkGeideaConfig() {
  console.log('🔍 فحص تكوين Geidea...');

  try {
    // استخدام API للتحقق من التكوين
    const response = await fetch('/api/geidea/config');
    const data = await response.json();

    if (data.success) {
      console.log('📋 تكوين Geidea:', data.config);
      
      if (data.isValid) {
        console.log('✅ تكوين Geidea صحيح');
      } else {
        console.warn('⚠️ متغيرات Geidea مفقودة:', data.missingFields);
        console.log('💡 الحل: أضف المتغيرات المفقودة إلى ملف .env أو .env.local');
      }
    } else {
      console.error('❌ فشل في فحص تكوين Geidea:', data.error);
    }

    return {
      isValid: data.isValid,
      missingFields: data.missingFields || [],
      config: data.config,
      isTestMode: data.isTestMode
    };
  } catch (error) {
    console.error('❌ خطأ في فحص تكوين Geidea:', error);
    return {
      isValid: false,
      missingFields: ['API_ERROR'],
      config: { error: 'Failed to check configuration' },
      isTestMode: true
    };
  }
}

// دالة اختبار API الدفع
export async function testPaymentAPI() {
  console.log('🧪 اختبار API الدفع...');
  
  try {
    const testData = {
      amount: '10.00',
      currency: 'SAR',
      merchantReferenceId: `TEST_${Date.now()}`,
      callbackUrl: `${window.location.origin}/api/geidea/webhook`,
      returnUrl: `${window.location.origin}/dashboard/payment/success`,
      customerEmail: 'test@example.com'
    };

    console.log('📤 إرسال بيانات الاختبار:', testData);

    const response = await fetch('/api/geidea/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('📥 استجابة API:', result);
    
    if (response.ok) {
      console.log('✅ اختبار API الدفع ناجح');
      return { success: true, data: result };
    } else {
      console.error('❌ اختبار API الدفع فشل:', result);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error('❌ خطأ في اختبار API الدفع:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// دالة فحص شامل للنظام
export async function fullSystemCheck() {
  console.log('🔍 === فحص شامل للنظام ===');
  
  // فحص Firebase
  checkFirebaseConfig();
  
  // فحص Geidea
  await checkGeideaConfig();
  
  // فحص المتصفح
  checkBrowserEnvironment();
  
  // فحص الأداء
  checkPerformance();
  
  // فحص المشاكل الشائعة
  checkCommonIssues();
  
  console.log('🔍 === انتهى الفحص الشامل ===');
}

// دوال مساعدة للفحص
function checkFirebaseConfig() {
  const requiredFields = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  ];
  
  const missingFields = requiredFields.filter(field => !process.env[field]);
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

function checkAuthProvider() {
  // فحص بسيط لوجود Firebase Auth
  const hasFirebaseAuth = typeof window !== 'undefined' && 
                         (window as any).firebase?.auth;
  
  return {
    isValid: hasFirebaseAuth,
    message: hasFirebaseAuth ? 'Firebase Auth متاح' : 'Firebase Auth غير متاح'
  };
}

function checkBrowserEnvironment() {
  console.log('🌐 فحص بيئة المتصفح...');
  
  const browserInfo = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    online: navigator.onLine,
    cookieEnabled: navigator.cookieEnabled
  };
  
  console.log('📱 معلومات المتصفح:', browserInfo);
  
  return browserInfo;
} 