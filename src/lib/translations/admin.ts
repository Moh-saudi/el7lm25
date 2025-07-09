// ملف ترجمة شامل لنظام الأدمن
// Admin Translation System

export const adminTranslations = {
  // Navigation & Layout
  nav: {
    dashboard: 'لوحة التحكم',
    users: 'إدارة المستخدمين',
    payments: 'المدفوعات والاشتراكات',
    reports: 'التقارير',
    settings: 'الإعدادات',
    system: 'مراقبة النظام',
    media: 'الميديا والتخزين',
    locations: 'المواقع الجغرافية',
    profiles: 'الملفات الشخصية',
    messages: 'التفاعلات والرسائل',
    logout: 'تسجيل الخروج'
  },

  // Common Actions
  actions: {
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    delete: 'حذف',
    view: 'عرض',
    add: 'إضافة',
    search: 'بحث',
    filter: 'فلترة',
    export: 'تصدير',
    import: 'استيراد',
    refresh: 'تحديث',
    download: 'تحميل',
    upload: 'رفع',
    approve: 'موافقة',
    reject: 'رفض',
    activate: 'تفعيل',
    deactivate: 'إلغاء التفعيل',
    loading: 'جاري التحميل...',
    processing: 'جاري المعالجة...',
    success: 'تم بنجاح',
    error: 'حدث خطأ',
    warning: 'تحذير',
    info: 'معلومات'
  },

  // Dashboard
  dashboard: {
    title: 'لوحة التحكم الإدارية متعددة العملات',
    welcome: 'أهلاً بك في نظام إدارة المنصة العالمية',
    baseCurrency: 'العملة الأساسية: الجنيه المصري (EGP)',
    lastUpdate: 'آخر تحديث',
    loading: 'جاري تحميل لوحة التحكم متعددة العملات...',
    
    stats: {
      totalUsers: 'إجمالي المستخدمين',
      players: 'اللاعبين',
      organizations: 'المؤسسات والأندية',
      supportedCurrencies: 'العملات المدعومة',
      bulkPayments: 'المدفوعات الجماعية',
      totalRevenue: 'إجمالي الإيرادات (جنيه مصري)',
      inUse: 'قيد الاستخدام',
      fromLastMonth: 'من الشهر الماضي'
    },

    currency: {
      title: 'نظام العملات المتعددة',
      description: 'عملة مدعومة • تحويل تلقائي',
      lastUpdateTime: 'آخر تحديث',
      refreshTooltip: 'تحديث أسعار الصرف الحية من ExchangeRate-API',
      loadingStats: 'جاري تحميل إحصائيات العملات...',
      users: 'المستخدمين',
      payments: 'المدفوعات',
      originalAmount: 'المبلغ الأصلي',
      convertedToEGP: 'محول للجنيه المصري',
      egpCurrency: 'جنيه'
    },

    activity: {
      title: 'النشاط الحديث',
      description: 'آخر أحداث النظام',
      newBulkPayment: 'دفعة جماعية جديدة بالريال السعودي (SAR)',
      ratesUpdated: 'تم تحديث أسعار الصرف - أكثر من 60 عملة محدثة',
      newPlayers: 'لاعبين جدد انضموا من دول مختلفة',
      usdPayment: 'دفعة بالدولار الأمريكي (تم التحويل تلقائياً للجنيه المصري)'
    },

    system: {
      title: 'حالة النظام',
      description: 'جميع الأنظمة تعمل بشكل طبيعي',
      currencyApi: 'واجهة برمجة العملات',
      firebase: 'Firebase',
      paymentSystem: 'نظام المدفوعات',
      performance: 'الأداء',
      online: 'متصل',
      connected: 'متصل',
      active: 'نشط',
      excellent: 'ممتاز'
    }
  },

  // Users Management
  users: {
    title: 'إدارة المستخدمين',
    subtitle: 'إدارة شاملة لجميع أنواع المستخدمين في المنصة',
    totalUsers: 'إجمالي المستخدمين',
    activeUsers: 'المستخدمين النشطين',
    newUsersToday: 'المستخدمين الجدد اليوم',
    verifiedUsers: 'المستخدمين المتحققين',
    
    types: {
      all: 'جميع المستخدمين',
      players: 'اللاعبين',
      clubs: 'الأندية',
      academies: 'الأكاديميات',
      trainers: 'المدربين',
      agents: 'وكلاء اللاعبين',
      scouts: 'الكشافين',
      independent: 'المستقلين'
    },

    status: {
      active: 'نشط',
      inactive: 'غير نشط',
      pending: 'قيد الانتظار',
      verified: 'متحقق',
      unverified: 'غير متحقق',
      suspended: 'موقوف'
    },

    actions: {
      viewProfile: 'عرض الملف الشخصي',
      editUser: 'تعديل المستخدم',
      verifyUser: 'تحقق من المستخدم',
      suspendUser: 'إيقاف المستخدم',
      deleteUser: 'حذف المستخدم',
      sendMessage: 'إرسال رسالة',
      viewPayments: 'عرض المدفوعات'
    }
  },

  // Payments
  payments: {
    title: 'إدارة المدفوعات والاشتراكات',
    subtitle: 'نظام متكامل لإدارة جميع المعاملات المالية',
    
    stats: {
      totalPayments: 'إجمالي المدفوعات',
      successfulPayments: 'المدفوعات الناجحة',
      failedPayments: 'المدفوعات الفاشلة',
      pendingPayments: 'المدفوعات المعلقة',
      totalRevenue: 'إجمالي الإيرادات',
      monthlyRevenue: 'الإيرادات الشهرية'
    },

    status: {
      success: 'ناجح',
      failed: 'فاشل',
      pending: 'معلق',
      refunded: 'مسترد',
      cancelled: 'ملغي'
    },

    types: {
      subscription: 'اشتراك',
      bulkPayment: 'دفعة جماعية',
      individual: 'دفعة فردية',
      premium: 'باقة مميزة'
    }
  },

  // Reports
  reports: {
    title: 'التقارير والإحصائيات',
    subtitle: 'تقارير شاملة وإحصائيات متقدمة',
    
    types: {
      financial: 'التقارير المالية',
      users: 'تقارير المستخدمين',
      activity: 'تقارير النشاط',
      performance: 'تقارير الأداء',
      security: 'تقارير الأمان'
    },

    periods: {
      today: 'اليوم',
      week: 'هذا الأسبوع',
      month: 'هذا الشهر',
      quarter: 'هذا الربع',
      year: 'هذه السنة',
      custom: 'فترة مخصصة'
    }
  },

  // Settings
  settings: {
    title: 'إعدادات النظام',
    subtitle: 'إدارة إعدادات المنصة والصلاحيات',
    
    categories: {
      general: 'الإعدادات العامة',
      security: 'الأمان والحماية',
      notifications: 'الإشعارات',
      payments: 'إعدادات المدفوعات',
      currencies: 'إعدادات العملات',
      permissions: 'الصلاحيات والأدوار'
    }
  },

  // System Monitoring
  system: {
    title: 'مراقبة النظام',
    subtitle: 'مراقبة شاملة لأداء وصحة النظام',
    
    health: {
      excellent: 'ممتاز',
      good: 'جيد',
      fair: 'مقبول',
      poor: 'ضعيف',
      critical: 'حرج'
    },

    metrics: {
      uptime: 'وقت التشغيل',
      responseTime: 'وقت الاستجابة',
      throughput: 'معدل المعالجة',
      errorRate: 'معدل الأخطاء',
      activeConnections: 'الاتصالات النشطة',
      cpuUsage: 'استخدام المعالج',
      memoryUsage: 'استخدام الذاكرة',
      diskUsage: 'استخدام القرص'
    },

    services: {
      firebase: 'Firebase',
      supabase: 'Supabase',
      paymentGateway: 'بوابة الدفع',
      emailService: 'خدمة البريد الإلكتروني',
      smsService: 'خدمة الرسائل النصية',
      fileStorage: 'تخزين الملفات',
      cdn: 'شبكة توصيل المحتوى'
    }
  },

  // Media Management
  media: {
    title: 'إدارة الوسائط والتخزين',
    subtitle: 'إدارة شاملة لجميع الملفات والوسائط',
    
    types: {
      images: 'الصور',
      videos: 'الفيديوهات',
      documents: 'المستندات',
      audio: 'الملفات الصوتية',
      other: 'ملفات أخرى'
    },

    storage: {
      totalUsed: 'المساحة المستخدمة',
      totalAvailable: 'المساحة المتاحة',
      buckets: 'الحاويات',
      files: 'الملفات'
    }
  },

  // Common UI Elements
  ui: {
    search: 'بحث...',
    filter: 'فلترة',
    sort: 'ترتيب',
    noData: 'لا توجد بيانات',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    success: 'تم بنجاح',
    confirm: 'تأكيد',
    cancel: 'إلغاء',
    yes: 'نعم',
    no: 'لا',
    ok: 'موافق',
    back: 'العودة',
    next: 'التالي',
    previous: 'السابق',
    first: 'الأول',
    last: 'الأخير',
    page: 'صفحة',
    of: 'من',
    showing: 'عرض',
    to: 'إلى',
    entries: 'عنصر',
    perPage: 'في الصفحة'
  },

  // Time & Date
  time: {
    now: 'الآن',
    today: 'اليوم',
    yesterday: 'أمس',
    thisWeek: 'هذا الأسبوع',
    lastWeek: 'الأسبوع الماضي',
    thisMonth: 'هذا الشهر',
    lastMonth: 'الشهر الماضي',
    thisYear: 'هذه السنة',
    lastYear: 'السنة الماضية',
    minutesAgo: 'منذ دقائق',
    hoursAgo: 'منذ ساعات',
    daysAgo: 'منذ أيام',
    weeksAgo: 'منذ أسابيع',
    monthsAgo: 'منذ أشهر',
    yearsAgo: 'منذ سنوات'
  },

  // Notifications
  notifications: {
    title: 'الإشعارات',
    new: 'جديد',
    read: 'مقروء',
    unread: 'غير مقروء',
    markAsRead: 'تحديد كمقروء',
    markAsUnread: 'تحديد كغير مقروء',
    deleteNotification: 'حذف الإشعار',
    clearAll: 'حذف الكل',
    noNotifications: 'لا توجد إشعارات'
  },

  // User Profile
  profile: {
    personalInfo: 'المعلومات الشخصية',
    contactInfo: 'معلومات التواصل',
    securitySettings: 'إعدادات الأمان',
    preferences: 'التفضيلات',
    activity: 'النشاط',
    statistics: 'الإحصائيات'
  },

  ar: {
    accountTypes: {
      player: 'لاعب',
      club: 'نادي',
      agent: 'وكيل',
      academy: 'أكاديمية',
      trainer: 'مدرب',
      admin: 'مدير',
      marketer: 'مسوق',
      parent: 'ولي أمر'
    }
  }
};

// دالة للحصول على الترجمة مع دعم المسارات المتداخلة
export function t(key: string, fallback?: string): string {
  const keys = key.split('.');
  let current: any = adminTranslations;
  
  for (const k of keys) {
    current = current?.[k];
    if (current === undefined) {
      return fallback || key;
    }
  }
  
  return current || fallback || key;
}

// دالة للحصول على الترجمة مع إدراج متغيرات
export function tWithVars(key: string, vars: Record<string, any> = {}, fallback?: string): string {
  let translation = t(key, fallback);
  
  // إدراج المتغيرات في النص
  Object.entries(vars).forEach(([varKey, varValue]) => {
    translation = translation.replace(new RegExp(`{{${varKey}}}`, 'g'), String(varValue));
  });
  
  return translation;
}

// تصدير الترجمات كافتراضي أيضاً
export default adminTranslations; 
