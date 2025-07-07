// نظام كونسول آمن - يخفي الرسائل في الإنتاج
const isClient = typeof window !== 'undefined';

// دالة فحص ما إذا كنا في بيئة تطوير آمنة
const isSafeToDevelop = () => {
  // التحقق من بيئة التطوير بطريقة آمنة
  const isDevelopment = (typeof window !== 'undefined' && window.process?.env?.NODE_ENV === 'development') || 
                       (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');
  
  if (!isClient) return isDevelopment;
  
  // فحص إضافي: هل النطاق محلي أم تطوير؟
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || 
                     hostname === '127.0.0.1' || 
                     hostname.startsWith('192.168.') ||
                     hostname.endsWith('.local');
  
  return isDevelopment && isLocalhost;
};

// إنشاء كونسول آمن
export const secureConsole = {
  log: (...args: any[]) => {
    if (isSafeToDevelop()) {
      console.log(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (isSafeToDevelop()) {
      console.warn(...args);
    }
  },
  
  error: (...args: any[]) => {
    if (isSafeToDevelop()) {
      console.error(...args);
    } else {
      // في الإنتاج، نسجل الأخطاء فقط دون تفاصيل حساسة
      console.error('خطأ في التطبيق - يرجى المحاولة لاحقاً');
    }
  },
  
  debug: (...args: any[]) => {
    if (isSafeToDevelop()) {
      console.debug(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isSafeToDevelop()) {
      console.info(...args);
    }
  },
  
  // دالة خاصة للمعلومات الحساسة
  sensitive: (...args: any[]) => {
    if (isSafeToDevelop()) {
      console.log('🔒 [SENSITIVE]', ...args);
    }
  },
  
  // دالة للتحقق من بيئة التطوير
  isDev: () => isSafeToDevelop()
};

// دالة للتهيئة الآمنة للكونسول (لا تعمل تلقائياً)
export const initializeSecureConsole = () => {
  // في الإنتاج، نحذف جميع دوال الكونسول الأصلية إذا لم نكن في بيئة آمنة
  if (isClient && !isSafeToDevelop()) {
    const noop = () => {};
    
    // حماية إضافية: تنظيف الكونسول في الإنتاج
    try {
      console.log = noop;
      console.debug = noop;
      console.info = noop;
      console.warn = noop;
      // نترك console.error للأخطاء المهمة فقط
      
      // إخفاء الأوامر المتقدمة
      if ((window as any).authDebugger) {
        delete (window as any).authDebugger;
      }
      
      // رسالة بسيطة للمطورين الفضوليين
      console.clear();
      console.log('%c🛡️ التطبيق محمي', 'color: #ff6b6b; font-size: 20px; font-weight: bold;');
      console.log('%cإذا كنت مطور، تحقق من بيئة التطوير المحلية', 'color: #666; font-size: 14px;');
      console.log('%c⚠️ تسجيل البيانات الحساسة محظور في الإنتاج', 'color: #ff9500; font-size: 12px;');
      console.log('%c📧 للدعم التقني: support@el7hm.com', 'color: #007AFF; font-size: 12px;');
      
    } catch (e) {
      // فشل في تنظيف الكونسول - لا بأس
    }
  }
};

export default secureConsole; 
