// نظام الترجمة الموحد - El7hm
// Unified Translation System

export type Language = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

// إعدادات اللغات المدعومة
export const SUPPORTED_LANGUAGES = {
  ar: {
    name: 'العربية',
    nativeName: 'العربية',
    direction: 'rtl' as Direction,
    flag: '🇸🇦',
    locale: 'ar-SA'
  },
  en: {
    name: 'English',
    nativeName: 'English',
    direction: 'ltr' as Direction,
    flag: '🇺🇸',
    locale: 'en-US'
  }
} as const;

// الحصول على اللغة الافتراضية
export const getDefaultLanguage = (): Language => {
  // Always default to Arabic for consistency between server and client
  if (typeof window !== 'undefined') {
    const savedLang = localStorage.getItem('el7hm-language') as Language;
    if (savedLang && SUPPORTED_LANGUAGES[savedLang]) {
      return savedLang;
    }
    
    // For now, always default to Arabic to prevent hydration issues
    // In the future, we can implement proper server-side language detection
    return 'ar';
  }
  return 'ar'; // افتراضي
};

// حفظ اللغة المختارة
export const setLanguage = (lang: Language): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('el7hm-language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = SUPPORTED_LANGUAGES[lang].direction;
  }
};

// الحصول على اتجاه اللغة
export const getLanguageDirection = (lang: Language): Direction => {
  return SUPPORTED_LANGUAGES[lang].direction;
};

// الحصول على معلومات اللغة
export const getLanguageInfo = (lang: Language) => {
  return SUPPORTED_LANGUAGES[lang];
};

// دالة الترجمة الأساسية
export const t = (key: string, language: Language = 'ar', fallback?: any): any => {
  // استيراد الترجمات حسب اللغة
  let translations: any;
  
  try {
    if (language === 'ar') {
      // استيراد مباشر للترجمة العربية
      const arTranslations = {
        home: {
          sections: {
            hero: {
              slide1: {
                title: "منصة إلحكم الرياضية",
                subtitle: "ربط اللاعبين بالفرص العالمية"
              },
              slide2: {
                title: "إدارة الأندية واللاعبين",
                subtitle: "منصة شاملة للرياضة"
              },
              slide3: {
                title: "وكالات اللاعبين",
                subtitle: "خدمات احترافية للتمثيل"
              },
              slide4: {
                title: "الأكاديميات الرياضية",
                subtitle: "تطوير المواهب والتدريب"
              },
              slide5: {
                title: "المدربين المحترفين",
                subtitle: "تدريب متخصص ومتقدم"
              },
              slide6: {
                title: "الكشافة والمواهب",
                subtitle: "اكتشاف وتطوير المواهب"
              },
              slide7: {
                title: "الرعاة والشركاء",
                subtitle: "شراكات استراتيجية"
              }
            },
            services: {
              title: "خدماتنا",
              performanceAnalysis: {
                title: "تحليل الأداء",
                description: "تقييم شامل لأداء اللاعب والتحليلات",
                button: "اعرف المزيد"
              },
              professionalOffers: {
                title: "العروض الاحترافية",
                description: "تواصل مع أفضل الأندية والفرص الاحترافية",
                button: "اعرف المزيد"
              },
              internationalTrials: {
                title: "الاختبارات الدولية",
                description: "الوصول للاختبارات الدولية وأحداث الكشف",
                button: "اعرف المزيد"
              },
              negotiationAgency: {
                title: "وكالة التفاوض",
                description: "التفاوض الاحترافي على العقود والتمثيل",
                button: "اعرف المزيد"
              },
              legalContracts: {
                title: "العقود القانونية",
                description: "مراجعة العقود القانونية وخدمات الامتثال",
                button: "اعرف المزيد"
              },
              logisticsServices: {
                title: "خدمات اللوجستيات",
                description: "دعم لوجستي كامل لانتقالات اللاعبين",
                button: "اعرف المزيد"
              }
            }
          }
        }
      };
      translations = arTranslations;
    } else {
      const enModule = require('./en');
      translations = enModule.default || enModule;
    }
  } catch (error) {
    console.warn(`Translation file not found for language: ${language}`, error);
    return fallback || key;
  }

  // البحث في الترجمات
  const keys = key.split('.');
  let current: any = translations;
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      // لا نطبع تحذير لكل مفتاح مفقود لتجنب الفيض في الكونسول
      return fallback || key;
    }
  }
  
  // إرجاع القيمة كما هي (يمكن أن تكون string, array, object, etc.)
  return current;
};

// دالة الترجمة مع متغيرات
export const tWithVars = (key: string, vars: Record<string, any> = {}, language: Language = 'ar', fallback?: string): string => {
  let translation = t(key, language, fallback);
  
  // إدراج المتغيرات في النص
  Object.entries(vars).forEach(([varKey, varValue]) => {
    translation = translation.replace(new RegExp(`{{${varKey}}}`, 'g'), String(varValue));
  });
  
  return translation;
};

// تنسيق التاريخ
export const formatDate = (date: Date | string, language: Language = 'ar', options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  return dateObj.toLocaleDateString(SUPPORTED_LANGUAGES[language].locale, defaultOptions);
};

// تنسيق الأرقام
export const formatNumber = (number: number, language: Language = 'ar'): string => {
  return number.toLocaleString(SUPPORTED_LANGUAGES[language].locale);
};

// تنسيق العملة
export const formatCurrency = (amount: number, currency: string = 'EGP', language: Language = 'ar'): string => {
  const currencyMap: Record<string, string> = {
    'EGP': language === 'ar' ? 'جنيه مصري' : 'Egyptian Pound',
    'SAR': language === 'ar' ? 'ريال سعودي' : 'Saudi Riyal',
    'AED': language === 'ar' ? 'درهم إماراتي' : 'UAE Dirham',
    'USD': language === 'ar' ? 'دولار أمريكي' : 'US Dollar',
    'EUR': language === 'ar' ? 'يورو' : 'Euro'
  };
  const currencyName = currencyMap[currency] || currency;
  return `${formatNumber(amount, language)} ${currencyName}`;
}; 