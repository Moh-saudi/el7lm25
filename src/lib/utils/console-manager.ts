/**
 * نظام إدارة رسائل الكونسول
 * يتيح التحكم في عرض رسائل التشخيص بناءً على البيئة والإعدادات
 */

interface ConsoleConfig {
  enableInDevelopment: boolean;
  enableInProduction: boolean;
  enableFirebase: boolean;
  enableAuth: boolean;
  enableDebug: boolean;
  enableDataFetch: boolean;
  enableMedia: boolean;
  enablePayment: boolean;
  enableSecurity: boolean;
}

// الإعدادات الافتراضية
const DEFAULT_CONFIG: ConsoleConfig = {
  enableInDevelopment: false, // إلغاء في التطوير أيضاً
  enableInProduction: false,  // إلغاء في الإنتاج
  enableFirebase: false,      // إلغاء رسائل Firebase
  enableAuth: false,          // إلغاء رسائل المصادقة
  enableDebug: false,         // إلغاء رسائل التشخيص
  enableDataFetch: false,     // إلغاء رسائل جلب البيانات
  enableMedia: false,         // إلغاء رسائل الوسائط
  enablePayment: false,       // إلغاء رسائل الدفع
  enableSecurity: false,      // إلغاء رسائل الأمان
};

class ConsoleManager {
  private config: ConsoleConfig;
  private isDevelopment: boolean;
  private originalConsole: Console;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.config = DEFAULT_CONFIG;
    this.originalConsole = { ...console };
    this.init();
  }

  private init() {
    // حفظ الدوال الأصلية
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;

    // استبدال دوال الكونسول
    console.log = (...args: any[]) => {
      if (this.shouldLog('debug', args)) {
        originalLog.apply(console, args);
      }
    };

    console.warn = (...args: any[]) => {
      if (this.shouldLog('warn', args)) {
        originalWarn.apply(console, args);
      }
    };

    console.error = (...args: any[]) => {
      // السماح بأخطاء مهمة فقط
      if (this.shouldLog('error', args)) {
        originalError.apply(console, args);
      }
    };

    console.info = (...args: any[]) => {
      if (this.shouldLog('info', args)) {
        originalInfo.apply(console, args);
      }
    };
  }

  private shouldLog(level: string, args: any[]): boolean {
    // فحص البيئة أولاً
    if (!this.isDevelopment && !this.config.enableInProduction) {
      return false;
    }
    
    if (this.isDevelopment && !this.config.enableInDevelopment) {
      return false;
    }

    // فحص المحتوى
    const message = args.join(' ').toLowerCase();
    
    // إلغاء جميع الرسائل التي تحتوي على رموز تشخيصية
    const diagnosticPatterns = [
      '🔥', '🎯', '✅', '❌', '🔍', '📊', '🎬', '📹', '🎂', '📅',
      '🔧', '🎨', '🗃️', '🚀', '🏢', '📋', '⚠️', '🔒', '💾', '📧',
      '👤', '🔗', '📝', '📷', '🚫', '💡', '⭐', '🎭', '🎪', '🎨'
    ];

    // فحص وجود رموز تشخيصية
    if (diagnosticPatterns.some(pattern => message.includes(pattern))) {
      return false;
    }

    // إلغاء رسائل Firebase
    if (!this.config.enableFirebase && (
      message.includes('firebase') ||
      message.includes('firestore') ||
      message.includes('analytics') ||
      message.includes('geidea')
    )) {
      return false;
    }

    // إلغاء رسائل المصادقة
    if (!this.config.enableAuth && (
      message.includes('auth') ||
      message.includes('login') ||
      message.includes('user') ||
      message.includes('مصادقة') ||
      message.includes('مستخدم')
    )) {
      return false;
    }

    // إلغاء رسائل جلب البيانات
    if (!this.config.enableDataFetch && (
      message.includes('fetch') ||
      message.includes('جلب') ||
      message.includes('loading') ||
      message.includes('تحميل') ||
      message.includes('data') ||
      message.includes('بيانات')
    )) {
      return false;
    }

    // إلغاء رسائل الوسائط
    if (!this.config.enableMedia && (
      message.includes('image') ||
      message.includes('video') ||
      message.includes('media') ||
      message.includes('صورة') ||
      message.includes('فيديو') ||
      message.includes('وسائط')
    )) {
      return false;
    }

    // إلغاء رسائل React Development
    if (message.includes('react') ||
        message.includes('fast refresh') ||
        message.includes('hmr') ||
        message.includes('rebuilding')) {
      return false;
    }

    // السماح بالأخطاء المهمة فقط
    if (level === 'error') {
      return message.includes('error') && !message.includes('🔍');
    }

    // إلغاء كل شيء آخر
    return false;
  }

  // تفعيل/إلغاء فئات معينة
  public updateConfig(newConfig: Partial<ConsoleConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // استعادة الكونسول الأصلي
  public restore() {
    Object.assign(console, this.originalConsole);
  }

  // إلغاء كامل
  public silenceAll() {
    console.log = () => {};
    console.warn = () => {};
    console.info = () => {};
    // الحفاظ على console.error للأخطاء المهمة
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const message = args.join(' ').toLowerCase();
      if (message.includes('critical') || message.includes('fatal')) {
        originalError.apply(console, args);
      }
    };
  }
}

// إنشاء مثيل واحد
export const consoleManager = new ConsoleManager();

// تصدير دالة للاستخدام المباشر
export const silenceConsole = () => {
  consoleManager.silenceAll();
};

// تفعيل الإلغاء عند التحميل
if (typeof window !== 'undefined') {
  // إلغاء فوري لجميع الرسائل
  consoleManager.silenceAll();
  
  // إلغاء رسائل أخرى محتملة
  window.addEventListener('error', (e) => {
    e.preventDefault();
    return false;
  });

  window.addEventListener('unhandledrejection', (e) => {
    e.preventDefault();
    return false;
  });
}

// مدير الكونسول المحسن
export const debugConsole = {
  playerReport: {
    start: (playerId: string, viewMode: boolean) => {
      console.log('📊 تشخيص صفحة تقارير اللاعب');
      console.log('معلومات الطلب:', {
        playerId,
        mode: viewMode ? 'عرض لاعب آخر' : 'عرض الملف الشخصي',
        timestamp: new Date().toISOString()
      });
    },

    playerData: (data: any) => {
      console.log('👤 بيانات اللاعب');
      console.log('المعلومات الأساسية:', {
        name: data?.full_name,
        birthDate: data?.birth_date,
        nationality: data?.nationality,
        position: data?.primary_position
      });
      console.log('المهارات:', {
        technical: Object.keys(data?.technical_skills || {}).length,
        physical: Object.keys(data?.physical_skills || {}).length,
        social: Object.keys(data?.social_skills || {}).length
      });
      console.log('الوسائط:', {
        hasProfileImage: !!data?.profile_image,
        additionalImages: (data?.additional_images || []).length,
        videos: (data?.videos || []).length,
        documents: (data?.documents || []).length
      });
    },

    images: (data: any) => {
      console.log('🖼️ معالجة الصور');
      console.log('الصورة الشخصية:', {
        url: data?.profile_image_url || data?.profile_image?.url,
        type: typeof data?.profile_image
      });
      console.log('الصور الإضافية:', {
        count: (data?.additional_images || []).length,
        urls: data?.additional_images?.map((img: any) => img.url)
      });
    },

    organization: (data: any) => {
      console.log('🏢 معلومات المنظمة');
      console.log('المعرفات:', {
        clubId: data?.club_id,
        academyId: data?.academy_id,
        trainerId: data?.trainer_id,
        agentId: data?.agent_id
      });
      console.log('معلومات إضافية:', {
        type: data?.organizationType,
        name: data?.organizationName,
        hasLogo: !!data?.organizationLogo
      });
    },

    error: (error: any, context: string) => {
      console.log('❌ خطأ في التقرير');
      console.error(`خطأ في ${context}:`, error);
      console.trace('تتبع الخطأ:');
    },

    end: () => {
      console.log('✅ انتهى تشخيص صفحة تقارير اللاعب');
    }
  }
}; 
