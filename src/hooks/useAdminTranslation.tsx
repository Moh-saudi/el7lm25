// Hook لتطبيق نظام الترجمة في صفحات الأدمن
import { useCallback } from 'react';
import { t, tWithVars } from '@/lib/translations/admin';

export const useAdminTranslation = () => {
  // دالة ترجمة أساسية
  const translate = useCallback((key: string, fallback?: string) => {
    return t(key, fallback);
  }, []);

  // دالة ترجمة مع متغيرات
  const translateWithVars = useCallback((key: string, vars: Record<string, any> = {}, fallback?: string) => {
    return tWithVars(key, vars, fallback);
  }, []);

  // ترجمات جاهزة للاستخدام المباشر
  const translations = {
    // الإجراءات الشائعة
    actions: {
      save: translate('actions.save'),
      cancel: translate('actions.cancel'),
      edit: translate('actions.edit'),
      delete: translate('actions.delete'),
      view: translate('actions.view'),
      add: translate('actions.add'),
      search: translate('actions.search'),
      filter: translate('actions.filter'),
      export: translate('actions.export'),
      import: translate('actions.import'),
      refresh: translate('actions.refresh'),
      download: translate('actions.download'),
      upload: translate('actions.upload'),
      approve: translate('actions.approve'),
      reject: translate('actions.reject'),
      loading: translate('actions.loading'),
      processing: translate('actions.processing'),
      success: translate('actions.success'),
      error: translate('actions.error')
    },

    // التنقل
    nav: {
      dashboard: translate('nav.dashboard'),
      users: translate('nav.users'),
      payments: translate('nav.payments'),
      reports: translate('nav.reports'),
      settings: translate('nav.settings'),
      system: translate('nav.system'),
      media: translate('nav.media'),
      locations: translate('nav.locations'),
      profiles: translate('nav.profiles'),
      messages: translate('nav.messages'),
      logout: translate('nav.logout')
    },

    // عناصر الواجهة
    ui: {
      search: translate('ui.search'),
      filter: translate('ui.filter'),
      sort: translate('ui.sort'),
      noData: translate('ui.noData'),
      loading: translate('ui.loading'),
      error: translate('ui.error'),
      success: translate('ui.success'),
      confirm: translate('ui.confirm'),
      cancel: translate('ui.cancel'),
      yes: translate('ui.yes'),
      no: translate('ui.no'),
      ok: translate('ui.ok'),
      back: translate('ui.back'),
      next: translate('ui.next'),
      previous: translate('ui.previous')
    },

    // الحالات والأنواع
    status: {
      active: 'نشط',
      inactive: 'غير نشط',
      pending: 'قيد الانتظار',
      verified: 'متحقق',
      unverified: 'غير متحقق',
      suspended: 'موقوف',
      connected: 'متصل',
      disconnected: 'غير متصل',
      error: 'خطأ',
      success: 'ناجح',
      failed: 'فاشل',
      cancelled: 'ملغي'
    },

    // أنواع المستخدمين
    userTypes: {
      all: translate('users.types.all'),
      players: translate('users.types.players'),
      clubs: translate('users.types.clubs'),
      academies: translate('users.types.academies'),
      trainers: translate('users.types.trainers'),
      agents: translate('users.types.agents'),
      scouts: translate('users.types.scouts'),
      independent: translate('users.types.independent')
    },

    // التواريخ والأوقات
    time: {
      now: translate('time.now'),
      today: translate('time.today'),
      yesterday: translate('time.yesterday'),
      thisWeek: translate('time.thisWeek'),
      lastWeek: translate('time.lastWeek'),
      thisMonth: translate('time.thisMonth'),
      lastMonth: translate('time.lastMonth'),
      thisYear: translate('time.thisYear'),
      lastYear: translate('time.lastYear')
    }
  };

  // دوال مساعدة للحالات والأنواع
  const getStatusText = useCallback((status: string): string => {
    const statusMap: Record<string, string> = {
      'active': 'نشط',
      'inactive': 'غير نشط',
      'pending': 'قيد الانتظار',
      'verified': 'متحقق',
      'unverified': 'غير متحقق',
      'suspended': 'موقوف',
      'connected': 'متصل',
      'disconnected': 'غير متصل',
      'error': 'خطأ',
      'success': 'ناجح',
      'failed': 'فاشل',
      'cancelled': 'ملغي',
      'limited': 'محدود',
      'empty': 'فارغ',
      'online': 'متصل',
      'offline': 'غير متصل'
    };
    return statusMap[status] || status;
  }, []);

  const getUserTypeText = useCallback((userType: string): string => {
    const userTypeMap: Record<string, string> = {
      'player': 'لاعب',
      'club': 'نادي',
      'academy': 'أكاديمية',
      'trainer': 'مدرب',
      'agent': 'وكيل لاعبين',
      'scout': 'كشاف',
      'admin': 'مدير النظام'
    };
    return userTypeMap[userType] || userType;
  }, []);

  // دالة لتنسيق التواريخ بالعربية
  const formatDate = useCallback((date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    return dateObj.toLocaleDateString('ar-SA', defaultOptions);
  }, []);

  // دالة لتنسيق الوقت بالعربية
  const formatTime = useCallback((time: Date | string) => {
    const timeObj = typeof time === 'string' ? new Date(time) : time;
    return timeObj.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // دالة لتنسيق التاريخ والوقت معاً
  const formatDateTime = useCallback((datetime: Date | string) => {
    const dateTimeObj = typeof datetime === 'string' ? new Date(datetime) : datetime;
    return dateTimeObj.toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // دالة لتنسيق الأرقام بالعربية
  const formatNumber = useCallback((number: number) => {
    return number.toLocaleString('ar-SA');
  }, []);

  // دالة لتنسيق أحجام الملفات
  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // دالة لتنسيق العملات
  const formatCurrency = useCallback((amount: number, currency: string = 'EGP') => {
    const currencyMap: Record<string, string> = {
      'EGP': 'جنيه مصري',
      'SAR': 'ريال سعودي',
      'AED': 'درهم إماراتي',
      'USD': 'دولار أمريكي',
      'EUR': 'يورو'
    };
    const currencyName = currencyMap[currency] || currency;
    return `${formatNumber(amount)} ${currencyName}`;
  }, [formatNumber]);

  // دالة للحصول على رسالة وقت نسبي (منذ...)
  const getRelativeTime = useCallback((date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMilliseconds = now.getTime() - dateObj.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`;
    if (diffInWeeks < 4) return `منذ ${diffInWeeks} أسبوع`;
    if (diffInMonths < 12) return `منذ ${diffInMonths} شهر`;
    return `منذ ${diffInYears} سنة`;
  }, []);

  return {
    // الدوال الأساسية
    t: translate,
    tWithVars: translateWithVars,
    
    // الترجمات الجاهزة
    translations,
    
    // دوال المساعدة
    getStatusText,
    getUserTypeText,
    formatDate,
    formatTime,
    formatDateTime,
    formatNumber,
    formatFileSize,
    formatCurrency,
    getRelativeTime
  };
};

export default useAdminTranslation; 
